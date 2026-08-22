import type { McpServer } from '@modelcontextprotocol/server';
import {
    existsSync,
    readdirSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { getWidgetType } from "@reactedge/widget-preset/widgetType"

export function registerListWidgetsTool(server: McpServer) {
    server.registerTool(
        'list_widgets',
        {
            title: 'List ReactEdge widgets',
            description:
                'Lists the ReactEdge widgets available in the current repository.',
            inputSchema: {},
        },
        async () => {
            const widgetsRoot = resolve(
                process.cwd(),
                'widgets',
            );

            if (!existsSync(widgetsRoot)) {
                return result({
                    widgets: [],
                    error: 'ReactEdge widgets directory not found',
                });
            }

            const widgets = readdirSync(widgetsRoot, {
                withFileTypes: true,
            })
                .filter((entry) => entry.isDirectory())
                .filter((entry) =>
                    existsSync(
                        resolve(
                            widgetsRoot,
                            entry.name,
                            'package.json',
                        ),
                    ),
                )
                .map((entry) => {
                    const widgetRoot = resolve(
                        widgetsRoot,
                        entry.name,
                    );

                    return {
                        id: entry.name,
                        type: getWidgetType(widgetRoot),
                    };
                })
                .sort((a, b) => a.id.localeCompare(b.id));

            return result({
                count: widgets.length,
                widgets,
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