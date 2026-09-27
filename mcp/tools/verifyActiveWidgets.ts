import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import {
    existsSync,
    readFileSync,
    statSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { ReactEdgeRoot } from '@reactedge/filesystem/reactedgeRoot';
import { getConfig } from '../config';

const COMMAND_TIMEOUT_MS = 15_000;
const MAX_OUTPUT_LENGTH = 6_000;

type RegistryEntry = {
    widget?: unknown;
};

type Registry = Record<string, RegistryEntry>;

type CommandResult = {
    passed: boolean;
    stdout: string;
    stderr: string;
    timedOut?: boolean;
    timeoutMs?: number;
    error?: string;
};

type TestCounts = {
    passed: number;
    failed: number;
};

export function registerVerifyActiveWidgetTool(server: McpServer) {
    server.registerTool(
        'verify_active_widget',
        {
            title: 'Verify an active ReactEdge widget',
            description:
                'Runs one bounded build or E2E test check for one active widget instance. Use list_active_widgets first, then verify one check at a time.',
            inputSchema: {
                instance: z.string().min(1),
                check: z.enum(['build', 'test']),
            },
        },
        async ({ instance, check }) => {
            const repositoryRoot = ReactEdgeRoot.get();
            const { storeCode } = getConfig();

            const manifestPath = resolve(
                repositoryRoot,
                'workspace',
                storeCode,
                'manifests',
                `${instance}.json`,
            );

            if (!existsSync(manifestPath)) {
                return result({
                    store: storeCode,
                    instance,
                    check,
                    passed: false,
                    error: `Widget instance "${instance}" is not active in store "${storeCode}".`,
                }, true);
            }

            const registry = readRegistry(repositoryRoot);
            const entry = registry[instance];

            if (!entry) {
                return result({
                    store: storeCode,
                    instance,
                    check,
                    passed: false,
                    error: `Active instance "${instance}" has no registry entry.`,
                }, true);
            }

            const widget = typeof entry.widget === 'string'
                ? entry.widget
                : instance;

            const packagePath = resolve(
                repositoryRoot,
                'widgets',
                widget,
                'package.json',
            );

            if (!existsSync(packagePath)) {
                return result({
                    store: storeCode,
                    instance,
                    widget,
                    check,
                    passed: false,
                    error: `Widget package does not exist: ${packagePath}`,
                }, true);
            }

            const verification = check === 'build'
                ? await verifyBuild(
                    repositoryRoot,
                    widget,
                    packagePath,
                )
                : await verifyTest(repositoryRoot, widget);

            return result({
                store: storeCode,
                instance,
                widget,
                check,
                ...verification,
            }, !verification.passed);
        },
    );
}

function readRegistry(repositoryRoot: string): Registry {
    const registryPath = resolve(
        repositoryRoot,
        'workspace',
        'registry.json',
    );

    if (!existsSync(registryPath)) {
        throw new Error(
            `ReactEdge registry does not exist: ${registryPath}`,
        );
    }

    const parsed = JSON.parse(
        readFileSync(registryPath, 'utf8'),
    ) as unknown;

    if (
        parsed === null ||
        Array.isArray(parsed) ||
        typeof parsed !== 'object'
    ) {
        throw new Error('ReactEdge registry must be a JSON object.');
    }

    return parsed as Registry;
}

async function verifyTest(
    repositoryRoot: string,
    widget: string,
) {
    const command = await runCommand(
        'mise',
        ['run', 'widget-test', '--', widget],
        repositoryRoot,
        COMMAND_TIMEOUT_MS,
    );
    const counts = parseTestCounts(command);

    return command.passed
        ? {
            passed: true,
            tests: counts,
        }
        : {
            passed: false,
            tests: counts,
            ...(command.timedOut && {
                timedOut: true,
                timeoutMs: command.timeoutMs,
            }),
            error: command.error ?? 'Widget E2E tests failed.',
            output: commandOutput(command),
        };
}

function parseTestCounts(command: CommandResult): TestCounts {
    const output = `${command.stdout}\n${command.stderr}`;

    return {
        passed: findLastCount(output, 'passed'),
        failed: findLastCount(output, 'failed'),
    };
}

function findLastCount(
    output: string,
    status: 'passed' | 'failed',
): number {
    const matches = [
        ...output.matchAll(
            new RegExp(`(\\d+)\\s+${status}\\b`, 'g'),
        ),
    ];
    const value = matches.at(-1)?.[1];

    return value
        ? Number.parseInt(value, 10)
        : 0;
}

async function verifyBuild(
    repositoryRoot: string,
    widget: string,
    packagePath: string,
) {
    const manifestPath = resolve(
        repositoryRoot,
        'workspace',
        'release',
        'source',
        widget,
        `widget-${widget}.manifest.json`,
    );
    const buildStartedAt = Date.now();

    const command = await runCommand(
        'mise',
        ['run', 'widget-build', '--', widget],
        repositoryRoot,
        COMMAND_TIMEOUT_MS,
    );

    if (!command.passed) {
        return {
            passed: false,
            manifestCreated: false,
            versionMatches: false,
            ...(command.timedOut && {
                timedOut: true,
                timeoutMs: command.timeoutMs,
            }),
            error: command.error ?? 'Widget build failed.',
            output: commandOutput(command),
        };
    }

    if (!existsSync(manifestPath)) {
        return {
            passed: false,
            manifestCreated: false,
            versionMatches: false,
            error:
                `Build completed but manifest was not created: ${manifestPath}`,
        };
    }

    const packageJson = JSON.parse(
        readFileSync(packagePath, 'utf8'),
    ) as { version?: unknown };
    const manifest = JSON.parse(
        readFileSync(manifestPath, 'utf8'),
    ) as { version?: unknown };

    const packageVersion =
        typeof packageJson.version === 'string'
            ? packageJson.version
            : undefined;
    const manifestVersion =
        typeof manifest.version === 'string'
            ? manifest.version
            : undefined;
    const manifestCreated =
        statSync(manifestPath).mtimeMs >= buildStartedAt;
    const versionMatches =
        packageVersion !== undefined &&
        packageVersion === manifestVersion;
    const passed = manifestCreated && versionMatches;

    return {
        passed,
        packageVersion,
        manifestVersion,
        manifestCreated,
        versionMatches,
        ...(!passed && {
            error: !manifestCreated
                ? 'Manifest exists but was not regenerated by this build.'
                : 'Manifest version does not match package.json version.',
        }),
    };
}

function runCommand(
    command: string,
    args: string[],
    cwd: string,
    timeoutMs: number,
): Promise<CommandResult> {
    return new Promise(resolveCommand => {
        const child = spawn(command, args, {
            cwd,
            env: process.env,
            detached: process.platform !== 'win32',
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';
        let spawnError: string | undefined;
        let finished = false;
        let timeout: ReturnType<typeof setTimeout> | undefined;

        child.stdout.on('data', chunk => {
            stdout = appendOutput(stdout, chunk.toString());
        });

        child.stderr.on('data', chunk => {
            stderr = appendOutput(stderr, chunk.toString());
        });

        child.on('error', error => {
            spawnError = error.message;
        });

        const finish = (commandResult: CommandResult) => {
            if (finished) {
                return;
            }

            finished = true;

            if (timeout) {
                clearTimeout(timeout);
            }

            resolveCommand(commandResult);
        };

        timeout = setTimeout(() => {
            terminateProcess(child);

            finish({
                passed: false,
                stdout,
                stderr,
                timedOut: true,
                timeoutMs,
                error:
                    `Command timed out after ${timeoutMs}ms: ${command} ${args.join(' ')}`,
            });
        }, timeoutMs);

        child.on('close', code => {
            const passed =
                !spawnError &&
                code === 0;

            finish({
                passed,
                stdout,
                stderr,
                ...(!passed && {
                    error: spawnError ??
                        `Command exited with code ${code}: ${command} ${args.join(' ')}`,
                }),
            });
        });
    });
}

function terminateProcess(
    child: ReturnType<typeof spawn>,
) {
    if (!child.pid || child.exitCode !== null) {
        return;
    }

    try {
        if (process.platform === 'win32') {
            child.kill('SIGTERM');
        } else {
            process.kill(-child.pid, 'SIGTERM');
        }
    } catch {
        child.kill('SIGTERM');
    }
}

function appendOutput(
    current: string,
    next: string,
): string {
    return trimOutput(current + next);
}

function trimOutput(value: string): string {
    return value.length <= MAX_OUTPUT_LENGTH
        ? value.trim()
        : value.slice(-MAX_OUTPUT_LENGTH).trim();
}

function commandOutput(command: CommandResult): string | undefined {
    const output = trimOutput(
        `${command.stdout}\n${command.stderr}`,
    );

    return output.length > 0
        ? output
        : undefined;
}

function result(data: unknown, isError = false) {
    return {
        content: [{
            type: 'text' as const,
            text: JSON.stringify(data, null, 2),
        }],
        ...(isError && { isError: true }),
    };
}
