import { execFile } from 'node:child_process';
import path from 'node:path';
import { ReactEdgeRoot } from "@reactedge/filesystem/reactedgeRoot"

type ExecuteRendererInput = {
    widgetName: string;
    contract: unknown;
    bootstrap: unknown;
    variant: string;
};

export function executeRenderer(
    input: ExecuteRendererInput,
): Promise<string> {
    const root = ReactEdgeRoot.get();

    const rendererPath = path.join(
        root,
        'services',
        'orchestrator',
        'ssr-worker',
        'render-ssr.ts',
    );

    const tsconfigPath = path.join(
        root,
        'widgets',
        input.widgetName,
        'tsconfig.app.json',
    );

    const tsxPath = path.join(
        root,
        'node_modules',
        '.bin',
        'tsx',
    );

    return new Promise((resolve, reject) => {
        const child = execFile(
            tsxPath,
            [
                '--tsconfig',
                tsconfigPath,
                rendererPath,
                input.widgetName,
                input.variant,
            ],
            {
                cwd: root,
                encoding: 'utf8',
                maxBuffer: 10 * 1024 * 1024,
                env: {
                    ...process.env,

                    // Local development only.
                    NODE_TLS_REJECT_UNAUTHORIZED: '0',
                },
            },
            (error, stdout, stderr) => {
                if (error) {
                    reject(
                        new Error(
                            `SSR renderer failed: ${stderr.trim() || error.message
                            }`,
                            { cause: error },
                        ),
                    );
                    return;
                }

                if (stdout.trim().length === 0) {
                    reject(
                        new Error(
                            `SSR renderer returned empty output${stderr.trim()
                                ? `: ${stderr.trim()}`
                                : ''
                            }`,
                        ),
                    );
                    return;
                }

                resolve(stdout);
            },
        );

        child.stdin?.end(
            JSON.stringify({
                contract: input.contract,
                bootstrap: input.bootstrap,
            })
        );
    });
}