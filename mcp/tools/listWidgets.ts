import type { McpServer } from '@modelcontextprotocol/server';
import {ReactEdgeRoot} from "@reactedge/filesystem/reactedgeRoot";
import { WidgetRegistry } from "../../packages/widget-registry";

export function registerListWidgetsTool(server: McpServer) {
    const registry = new WidgetRegistry(
        ReactEdgeRoot.get(),
    );

    server.registerTool(
        'list_widgets',
        {
            title: 'List ReactEdge widgets',
            description:
                'Lists the ReactEdge widgets available in the current repository.',
            inputSchema: {},
        },
        async () => {
            const widgets = registry
                .list()
                .map((capability) => ({
                    id: capability.id,
                    type: capability.type,
                }))
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