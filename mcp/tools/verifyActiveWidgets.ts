import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import { ReactEdgeRoot } from '@reactedge/filesystem/reactedgeRoot';
import {
    ActiveWidgetVerifier,
    RuntimeReadinessValidator,
} from '@reactedge/widget-validation';
import { getConfig } from '../config';

export function registerVerifyActiveWidgetTool(server: McpServer) {
    const repositoryRoot = ReactEdgeRoot.get();
    const readinessValidator = new RuntimeReadinessValidator(
        repositoryRoot,
    );
    const verifier = new ActiveWidgetVerifier(
        repositoryRoot,
    );

    server.registerTool(
        'verify_active_widget',
        {
            title: 'Verify an active ReactEdge widget',
            description:
                'Checks that one active widget can run in the current environment before executing one bounded build or E2E test check.',
            inputSchema: {
                instance: z.string().min(1),
                check: z.enum(['build', 'test']),
            },
        },
        async ({ instance, check }) => {
            const config = getConfig();

            const readiness = readinessValidator.validate(
                config.storeCode,
                instance,
                config,
            );

            if (!readiness.passed) {
                return result(
                    readiness,
                    true,
                );
            }

            const verification = await verifier.verify(
                config.storeCode,
                instance,
                check,
            );

            return result(
                {
                    ...verification,
                    runtimeReady: true,
                    runtimeRequirements: readiness.requirements,
                },
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
