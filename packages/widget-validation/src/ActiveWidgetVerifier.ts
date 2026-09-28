import {
    existsSync,
    readFileSync,
    statSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const COMMAND_TIMEOUT_MS = 15_000;
const MAX_OUTPUT_LENGTH = 6_000;

export type ActiveWidgetVerificationCheck =
    | 'build'
    | 'test';

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

export type ActiveWidgetVerificationResult = {
    store: string;
    instance: string;
    widget?: string;
    check: ActiveWidgetVerificationCheck;
    passed: boolean;
    tests?: TestCounts;
    packageVersion?: string;
    manifestVersion?: string;
    manifestCreated?: boolean;
    versionMatches?: boolean;
    timedOut?: boolean;
    timeoutMs?: number;
    error?: string;
    output?: string;
};

export class ActiveWidgetVerifier {
    constructor(
        private readonly repositoryRoot: string,
    ) {}

    async verify(
        store: string,
        instance: string,
        check: ActiveWidgetVerificationCheck,
    ): Promise<ActiveWidgetVerificationResult> {
        const deploymentManifestPath = resolve(
            this.repositoryRoot,
            'workspace',
            store,
            'manifests',
            `${instance}.json`,
        );

        if (!existsSync(deploymentManifestPath)) {
            return {
                store,
                instance,
                check,
                passed: false,
                error:
                    `Widget instance "${instance}" is not active in store "${store}".`,
            };
        }

        const registry = this.readRegistry();
        const entry = registry[instance];

        if (!entry) {
            return {
                store,
                instance,
                check,
                passed: false,
                error:
                    `Active instance "${instance}" has no registry entry.`,
            };
        }

        const widget = typeof entry.widget === 'string'
            ? entry.widget
            : instance;

        const packagePath = resolve(
            this.repositoryRoot,
            'widgets',
            widget,
            'package.json',
        );

        if (!existsSync(packagePath)) {
            return {
                store,
                instance,
                widget,
                check,
                passed: false,
                error: `Widget package does not exist: ${packagePath}`,
            };
        }

        const verification = check === 'build'
            ? await this.verifyBuild(widget, packagePath)
            : await this.verifyTest(widget);

        return {
            store,
            instance,
            widget,
            check,
            ...verification,
        };
    }

    private readRegistry(): Registry {
        const registryPath = resolve(
            this.repositoryRoot,
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
            throw new Error(
                'ReactEdge registry must be a JSON object.',
            );
        }

        return parsed as Registry;
    }

    private async verifyTest(widget: string) {
        const command = await this.runCommand(
            'mise',
            ['run', 'widget-test', '--', widget],
            COMMAND_TIMEOUT_MS,
        );
        const tests = this.parseTestCounts(command);

        return command.passed
            ? {
                passed: true,
                tests,
            }
            : {
                passed: false,
                tests,
                ...(command.timedOut && {
                    timedOut: true,
                    timeoutMs: command.timeoutMs,
                }),
                error:
                    command.error ?? 'Widget E2E tests failed.',
                output: this.commandOutput(command),
            };
    }

    private async verifyBuild(
        widget: string,
        packagePath: string,
    ) {
        const manifestPath = resolve(
            this.repositoryRoot,
            'workspace',
            'release',
            'source',
            widget,
            `widget-${widget}.manifest.json`,
        );
        const buildStartedAt = Date.now();

        const command = await this.runCommand(
            'mise',
            ['run', 'widget-build', '--', widget],
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
                output: this.commandOutput(command),
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

    private runCommand(
        command: string,
        args: string[],
        timeoutMs: number,
    ): Promise<CommandResult> {
        return new Promise(resolveCommand => {
            const child = spawn(command, args, {
                cwd: this.repositoryRoot,
                env: process.env,
                detached: process.platform !== 'win32',
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            let stdout = '';
            let stderr = '';
            let spawnError: string | undefined;
            let finished = false;

            child.stdout.on('data', chunk => {
                stdout = this.appendOutput(
                    stdout,
                    chunk.toString(),
                );
            });

            child.stderr.on('data', chunk => {
                stderr = this.appendOutput(
                    stderr,
                    chunk.toString(),
                );
            });

            child.on('error', error => {
                spawnError = error.message;
            });

            const finish = (commandResult: CommandResult) => {
                if (finished) {
                    return;
                }

                finished = true;

                clearTimeout(timeout);

                resolveCommand(commandResult);
            };

            const timeout = setTimeout(() => {
                this.terminateProcess(child);

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

    private terminateProcess(
        child: ReturnType<typeof spawn>,
    ): void {
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

    private parseTestCounts(
        command: CommandResult,
    ): TestCounts {
        const output = `${command.stdout}\n${command.stderr}`;

        return {
            passed: this.findLastCount(output, 'passed'),
            failed: this.findLastCount(output, 'failed'),
        };
    }

    private findLastCount(
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

    private appendOutput(
        current: string,
        next: string,
    ): string {
        return this.trimOutput(current + next);
    }

    private trimOutput(value: string): string {
        return value.length <= MAX_OUTPUT_LENGTH
            ? value.trim()
            : value.slice(-MAX_OUTPUT_LENGTH).trim();
    }

    private commandOutput(
        command: CommandResult,
    ): string | undefined {
        const output = this.trimOutput(
            `${command.stdout}\n${command.stderr}`,
        );

        return output.length > 0
            ? output
            : undefined;
    }
}
