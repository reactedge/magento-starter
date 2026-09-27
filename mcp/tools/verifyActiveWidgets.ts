import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import {
    existsSync,
    readFileSync,
    statSync,
} from 'node:fs';
import { resolve } from 'node:path';
import {
    spawn,
    type ChildProcessWithoutNullStreams,
} from 'node:child_process';
import { ReactEdgeRoot } from '@reactedge/filesystem/reactedgeRoot';
import { getConfig } from '../config';

const DEV_URL = 'http://localhost:5173/?reactedge_debug=eager';
const DEV_TIMEOUT_MS = 20_000;
const COMMAND_TIMEOUT_MS = 50_000;
const MAX_OUTPUT_LENGTH = 6_000;

type RegistryEntry = {
    widget?: unknown;
};

type Registry = Record<string, RegistryEntry>;

type CommandResult = {
    passed: boolean;
    stdout: string;
    stderr: string;
    error?: string;
};

export function registerVerifyActiveWidgetTool(server: McpServer) {
    server.registerTool(
        'verify_active_widget',
        {
            title: 'Verify an active ReactEdge widget',
            description:
                'Runs one bounded verification check for one active widget instance. Use list_active_widgets first, then call this tool for dev, test, and build checks.',
            inputSchema: {
                instance: z.string().min(1),
                check: z.enum(['dev', 'test', 'build']),
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

            const verification = check === 'dev'
                ? await verifyDevelopment(repositoryRoot, widget)
                : check === 'test'
                    ? await verifyTest(repositoryRoot, widget)
                    : await verifyBuild(
                        repositoryRoot,
                        widget,
                        packagePath,
                    );

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

async function verifyDevelopment(
    repositoryRoot: string,
    widget: string,
) {
    const expectedElement = `${widget}-widget`;
    const child = spawn(
        'mise',
        ['run', 'widget-dev', '--', widget],
        {
            cwd: repositoryRoot,
            env: process.env,
            detached: process.platform !== 'win32',
            stdio: ['ignore', 'pipe', 'pipe'],
        },
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
        stdout = appendOutput(stdout, chunk.toString());
    });

    child.stderr.on('data', chunk => {
        stderr = appendOutput(stderr, chunk.toString());
    });

    try {
        await waitForDevelopmentServer(child);

        const smoke = await runCommand(
            'node',
            [
                '--input-type=module',
                '-e',
                browserSmokeScript(),
                expectedElement,
            ],
            repositoryRoot,
            DEV_TIMEOUT_MS,
        );

        return smoke.passed
            ? {
                passed: true,
                element: expectedElement,
            }
            : {
                passed: false,
                element: expectedElement,
                error: smoke.error ??
                    `Expected DOM element <${expectedElement}> was not found.`,
                output: commandOutput(smoke),
            };
    } catch (error) {
        return {
            passed: false,
            element: expectedElement,
            error: error instanceof Error
                ? error.message
                : String(error),
            output: trimOutput(`${stdout}\n${stderr}`),
        };
    } finally {
        terminateProcess(child);

        await runCommand(
            resolve(
                repositoryRoot,
                'launcher',
                'scripts',
                'widgets-clean.sh',
            ),
            [],
            repositoryRoot,
            10_000,
        );
    }
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

    return command.passed
        ? { passed: true }
        : {
            passed: false,
            error: command.error ?? 'Widget E2E tests failed.',
            output: commandOutput(command),
        };
}

async function waitForDevelopmentServer(
    child: ChildProcessWithoutNullStreams,
): Promise<void> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < DEV_TIMEOUT_MS) {
        if (child.exitCode !== null) {
            throw new Error(
                `widget-dev exited before ${DEV_URL} became available.`,
            );
        }

        try {
            const response = await fetch(DEV_URL);

            if (response.ok) {
                return;
            }
        } catch {
            // Vite has not started listening yet.
        }

        await delay(500);
    }

    throw new Error(
        `Timed out waiting for widget-dev at ${DEV_URL}.`,
    );
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

function browserSmokeScript(): string {
    return `
import { chromium } from 'playwright';

const selector = process.argv[1];
const browser = await chromium.launch({ headless: true });

try {
    const page = await browser.newPage();
    await page.goto('${DEV_URL}', {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
    });

    const element = page.locator(selector);
    await element.waitFor({
        state: 'attached',
        timeout: 10000,
    });

    if (await element.count() < 1) {
        throw new Error('DOM element not found: ' + selector);
    }
} finally {
    await browser.close();
}
`;
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
        let timedOut = false;

        child.stdout.on('data', chunk => {
            stdout = appendOutput(stdout, chunk.toString());
        });

        child.stderr.on('data', chunk => {
            stderr = appendOutput(stderr, chunk.toString());
        });

        child.on('error', error => {
            spawnError = error.message;
        });

        const timeout = setTimeout(() => {
            timedOut = true;
            terminateProcess(child);
        }, timeoutMs);

        child.on('close', code => {
            clearTimeout(timeout);

            const passed =
                !timedOut &&
                !spawnError &&
                code === 0;

            resolveCommand({
                passed,
                stdout,
                stderr,
                ...(!passed && {
                    error: timedOut
                        ? `Command timed out after ${timeoutMs}ms: ${command} ${args.join(' ')}`
                        : spawnError ??
                            `Command exited with code ${code}: ${command} ${args.join(' ')}`,
                }),
            });
        });
    });
}

function terminateProcess(
    child: ChildProcessWithoutNullStreams,
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

function delay(milliseconds: number): Promise<void> {
    return new Promise(resolveDelay => {
        setTimeout(resolveDelay, milliseconds);
    });
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
