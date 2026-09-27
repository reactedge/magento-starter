import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import { ReactEdgeRoot } from '@reactedge/filesystem/reactedgeRoot';
import { ActiveWidgetVerifier } from '@reactedge/widget-validation';
import { getConfig } from '../config';

export function registerVerifyActiveWidgetTool(server: McpServer) {
    const verifier = new ActiveWidgetVerifier(
        ReactEdgeRoot.get(),
    );

    server.registerTool(
        'verify_active_widget',
        {
            title: 'Verify an active ReactEdge widget',
            description:
                'Runs one bounded build or E2E test check for one active widget instance. Use list_active_widgets first, then verify one check at a time.',
            inputSchema: {
                instance: z.string().min(1),
                check: z.enum(['build', 'test']),
            },
        },
        async ({ instance, check }) => {
            const { storeCode } = getConfig();
            const verification = await verifier.verify(
                storeCode,
                instance,
                check,
            );

            return result(
                verification,
                !verification.passed,
            );
        },
    );
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
