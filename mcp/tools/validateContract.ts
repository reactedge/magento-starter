import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function getWidgetSchema(widget: string) {
    // Prevent paths such as ../../something
    if (!/^[a-zA-Z0-9_-]+$/.test(widget)) {
        throw new Error(`Invalid widget name: ${widget}`);
    }

    const schemaPath = resolve(
        process.cwd(),
        'widgets',
        widget,
        'src',
        'ConfigSchema.ts',
    );

    if (!existsSync(schemaPath)) {
        throw new Error(`Unknown widget: ${widget}`);
    }

    const module = await import(pathToFileURL(schemaPath).href);

    if (!module.WidgetConfigSchema) {
        throw new Error(
            `Widget "${widget}" does not export WidgetConfigSchema`,
        );
    }

    return module.WidgetConfigSchema;
}

export function registerValidateContractTool(server: McpServer) {
    server.registerTool(
        'validate_contract',
        {
            title: 'Validate ReactEdge widget contract',
            description:
                'Validates a configuration against the authoritative ReactEdge widget schema.',
            inputSchema: {
                widget: z.string().min(1),
                contract: z.unknown(),
            },
        },
        async ({ widget, contract }) => {
            try {
                const schema = await getWidgetSchema(widget);
                const result = schema.safeParse(contract);

                if (result.success) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(
                                    {
                                        widget,
                                        valid: true,
                                    },
                                    null,
                                    2,
                                ),
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    widget,
                                    valid: false,
                                    issues: result.error.issues.map(
                                        (issue) => ({
                                            path: issue.path.join('.'),
                                            message: issue.message,
                                        }),
                                    ),
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    widget,
                                    valid: false,
                                    error:
                                        error instanceof Error
                                            ? error.message
                                            : 'Unknown validation error',
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}