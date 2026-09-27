import type { McpServer } from '@modelcontextprotocol/server';
import { existsSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { ReactEdgeRoot } from '@reactedge/filesystem/reactedgeRoot';
import { getConfig } from '../config';

export function registerListActiveWidgetsTool(server: McpServer) {
    server.registerTool('list_active_widgets', {
        title: 'List active ReactEdge widgets',
        description: 'Lists the ReactEdge widget instances deployed in the current environment.',
        inputSchema: {},
    }, async () => {
        const { storeCode } = getConfig();
        const manifestsDirectory = resolve(
            ReactEdgeRoot.get(),
            'workspace',
            storeCode,
            'manifests',
        );

        const widgets = existsSync(manifestsDirectory)
            ? readdirSync(manifestsDirectory)
                .filter(file => file.endsWith('.json'))
                .map(file => ({
                    id: basename(file, '.json'),
                    active: true,
                }))
                .sort((a, b) => a.id.localeCompare(b.id))
            : [];

        return result({
            store: storeCode,
            count: widgets.length,
            widgets,
        });
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
