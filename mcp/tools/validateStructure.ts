import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import {
    existsSync,
    readFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { getWidgetType } from "@reactedge/widget-preset/widgetType"

const requiredFiles = {
    standard: [
        'src/Config.ts',
        'src/ConfigSchema.ts',
        'src/WidgetView.tsx',
        'src/bootstrap/WidgetWrapper.tsx',
    ],

    runtime: [
        'src/Config.ts',
        'src/ConfigSchema.ts',
        'src/ConfigSchemaRuntime.ts',
        'src/WidgetView.tsx',
        'src/bootstrap/WidgetWrapper.tsx',
    ],
} as const;

const sharedFiles = [
    'vite.npm.config.ts',
    'vite.config.ts',
    'tsconfig.node.json',
    'tsconfig.json',
    'tsconfig.app.json',

    'api/index.ts',

    'src/entrypoints/npm.tsx',
    'src/entrypoints/ssr.tsx',

    'src/Widget.tsx',

    'src/bootstrap/widget-root.tsx',
    'src/bootstrap/widget-ssr-component.tsx',

    'src/activity/Context/ActivityContextProvider.tsx',
    'src/activity/Context/ActivityContext.tsx',
    'src/activity/Context/useActivityContext.ts'
] as const;

const variantFiles = {
    standard: [
        'api/widget.tsx',
    ],

    runtime: [
        'api/runtime-widget.tsx',
        'src/ConfigSchemaRuntime.ts',
        'public/reactedge-runtime.json',
    ],
} as const;

function filesMatch(actual: string, canonical: string): boolean {
    return readFileSync(actual).equals(readFileSync(canonical));
}

export function registerValidateStructureTool(server: McpServer) {
    server.registerTool(
        'validate_structure',
        {
            title: 'Validate ReactEdge widget structure',
            description:
                'Validates a widget byte-for-byte against the canonical ReactEdge structure.',
            inputSchema: {
                widget: z.string().min(1)
            },
        },

        async ({ widget }) => {
            const widgetRoot = resolve(
                process.cwd(),
                'widgets',
                widget,
            );

            const variant = getWidgetType(widgetRoot)

            const canonicalRoot = resolve(
                process.cwd(),
                'packages',
                'widget-template',
                variant,
            );

            if (!existsSync(widgetRoot)) {
                return result({
                    widget,
                    variant,
                    valid: false,
                    error: `Unknown widget: ${widget}`,
                });
            }

            if (!existsSync(canonicalRoot)) {
                return result({
                    widget,
                    variant,
                    valid: false,
                    error: `Canonical ${variant} template not found`,
                });
            }

            const files = [
                ...sharedFiles,
                ...variantFiles[variant],
            ];

            const missing: string[] = [];
            const canonicalMissing: string[] = [];
            const modified: string[] = [];

            for (const file of requiredFiles[variant]) {
                const actual = resolve(widgetRoot, file);

                if (!existsSync(actual)) {
                    missing.push(file);
                }
            }

            for (const file of files) {
                const actual = resolve(widgetRoot, file);
                const canonical = resolve(canonicalRoot, file);

                if (!existsSync(actual)) {
                    missing.push(file);
                    continue;
                }

                if (!existsSync(canonical)) {
                    canonicalMissing.push(file);
                    continue;
                }

                if (!filesMatch(actual, canonical)) {
                    modified.push(file);
                }
            }

            return result({
                widget,
                variant,
                valid:
                    missing.length === 0 &&
                    canonicalMissing.length === 0 &&
                    modified.length === 0,

                missing,
                canonicalMissing,
                modified,
            });
        },
    );
}

function result(data: unknown) {
    return {
        content: [
            {
                type: 'text' as const,
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
}