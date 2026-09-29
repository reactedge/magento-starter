import type { McpServer } from '@modelcontextprotocol/server';
import { existsSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { ReactEdgeRoot } from '@reactedge/filesystem/reactedgeRoot';
import { RuntimeReadinessValidator } from '@reactedge/widget-validation';
import { getConfig } from '../config';

export function registerListActiveWidgetsTool(server: McpServer) {
    const readinessValidator = new RuntimeReadinessValidator(
        ReactEdgeRoot.get(),
    );

    server.registerTool('list_active_widgets', {
        title: 'List active ReactEdge widgets',
        description:
            'Lists the ReactEdge widget instances deployed in the current environment and reports whether each instance has the runtime dependencies required to run.',
        inputSchema: {},
    }, async () => {
        const config = getConfig();
        const { storeCode } = config;
        const manifestsDirectory = resolve(
            ReactEdgeRoot.get(),
            'workspace',
            storeCode,
            'manifests',
        );

        const widgets = existsSync(manifestsDirectory)
            ? readdirSync(manifestsDirectory)
                .filter(file => file.endsWith('.json'))
                .map(file => {
                    const id = basename(file, '.json');
                    const readiness = readinessValidator.validate(
                        storeCode,
                        id,
                        config,
                    );

                    return {
                        id,
                        widget: readiness.widget,
                        active: true,
                        ready: {
                            passed: readiness.passed,
                            requirements: readiness.requirements,
                            ...(readiness.error && {
                                error: readiness.error,
                            }),
                        },
                    };
                })
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
