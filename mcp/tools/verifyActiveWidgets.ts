import type { McpServer } from '@modelcontextprotocol/server';
import {
    existsSync,
    readFileSync,
    readdirSync,
    statSync,
} from 'node:fs';
import { basename, resolve } from 'node:path';
import {
    spawn,
    type ChildProcess,
} from 'node:child_process';
import { ReactEdgeRoot } from '@reactedge/filesystem/reactedgeRoot';
import { getConfig } from '../config';

const DEV_URL = 'http://localhost:5173/?reactedge_debug=eager';
const DEV_TIMEOUT_MS = 30_000;
const COMMAND_TIMEOUT_MS = 180_000;
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

type DevResult = {
    passed: boolean;
    element: string;
    error?: string;
    output?: string;
};

type BuildResult = {
    passed: boolean;
    packageVersion?: string;
    manifestVersion?: string;
    manifestCreated: boolean;
    versionMatches: boolean;
    error?: string;
    output?: string;
};

export function registerVerifyActiveWidgetsTool(server: McpServer) {
    server.registerTool('verify_active_widgets', {
        title: 'Verify active ReactEdge widgets',
        description:
            'Runs development, E2E test, and build checks for every active widget in the current environment.',
        inputSchema: {},
    }, async () => {
        const repositoryRoot = ReactEdgeRoot.get();
        const { storeCode } = getConfig();
        const activeInstances = listActiveInstances(
            repositoryRoot,
            storeCode,
        );
        const registry = readRegistry(repositoryRoot);
        const unresolved: Array<{
            instance: string;
            error: string;
        }> = [];
        const targets = new Map<string, string[]>();

        for (const instance of activeInstances) {
            const entry = registry[instance];

            if (!entry) {
                unresolved.push({
                    instance,
                    error: `Active instance "${instance}" has no registry entry.`,
                });
                continue;
            }

            const widget = typeof entry.widget === 'string'
                ? entry.widget
                : instance;
            const instances = targets.get(widget) ?? [];

            instances.push(instance);
            targets.set(widget, instances);
        }

        const widgets = [];

        for (const [widget, instances] of targets) {
            widgets.push(
                await verifyWidget(
                    repositoryRoot,
                    widget,
                    instances,
                ),
            );
        }

        const valid =
            unresolved.length === 0 &&
            widgets.every(widget => widget.valid);

        return result({
            store: storeCode,
            activeInstances: activeInstances.length,
            widgetsChecked: widgets.length,
            valid,
            unresolved,
            widgets,
        });
    });
}

function listActiveInstances(
    repositoryRoot: string,
    storeCode: string,
): string[] {
    const manifestsDirectory = resolve(
        repositoryRoot,
        'workspace',
        storeCode,
        'manifests',
    );

    if (!existsSync(manifestsDirectory)) {
        return [];
    }

    return readdirSync(manifestsDirectory)
        .filter(file => file.endsWith('.json'))
        .map(file => basename(file, '.json'))
        .sort((a, b) => a.localeCompare(b));
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

async function verifyWidget(
    repositoryRoot: string,
    widget: string,
    instances: string[],
) {
    const packagePath = resolve(
        repositoryRoot,
        'widgets',
        widget,
        'package.json',
    );

    if (!existsSync(packagePath)) {
        return {
            widget,
            instances,
            valid: false,
            dev: {
                passed: false,
                element: `${widget}-widget`,
                error: `Widget package does not exist: ${packagePath}`,
            },
            test: {
                passed: false,
                error: 'Widget package is unavailable.',
            },
            build: {
                passed: false,
                manifestCreated: false,
                versionMatches: false,
                error: 'Widget package is unavailable.',
            },
        };
    }

    const dev = await verifyDevelopment(repositoryRoot, widget);
    const testCommand = await runCommand(
        'mise',
        ['run', 'widget-test', '--', widget],
        repositoryRoot,
        COMMAND_TIMEOUT_MS,
    );
    const test = {
        passed: testCommand.passed,
        ...(!testCommand.passed && {
            error: testCommand.error ?? 'Widget E2E tests failed.',
            output: commandOutput(testCommand),
        }),
    };
    const build = await verifyBuild(
        repositoryRoot,
        widget,
        packagePath,
    );

    return {
        widget,
        instances,
        valid: dev.passed && test.passed && build.passed,
        dev,
        test,
        build,
    };
}

async function verifyDevelopment(
    repositoryRoot: string,
    widget: string,
): Promise<DevResult> {
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

    child.stdout?.on('data', chunk => {
        stdout = appendOutput(stdout, chunk.toString());
    });
    child.stderr?.on('data', chunk => {
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

        if (!smoke.passed) {
            return {
                passed: false,
                element: expectedElement,
                error: smoke.error ??
                    `Expected DOM element <${expectedElement}> was not found.`,
                output: commandOutput(smoke),
            };
        }

        return {
            passed: true,
            element: expectedElement,
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

async function waitForDevelopmentServer(
    child: ChildProcess,
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
): Promise<BuildResult> {
    const manifestPath = resolve(
        repositoryRoot,
        'workspace',
        'release',
        'source',
        widget,
        `widget-${widget}.manifest.json`,
    );
    const previousManifestMtime = existsSync(manifestPath)
        ? statSync(manifestPath).mtimeMs
        : undefined;
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
    const currentManifestMtime = statSync(manifestPath).mtimeMs;
    const manifestCreated = previousManifestMtime === undefined ||
        currentManifestMtime > previousManifestMtime;
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

        child.stdout?.on('data', chunk => {
            stdout = appendOutput(stdout, chunk.toString());
        });
        child.stderr?.on('data', chunk => {
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

function terminateProcess(child: ChildProcess) {
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

function result(data: unknown) {
    return {
        content: [{
            type: 'text' as const,
            text: JSON.stringify(data, null, 2),
        }],
    };
}
