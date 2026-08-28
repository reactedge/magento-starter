import type { McpServer } from '@modelcontextprotocol/server';
import { probePdpSignals } from '../probes/pdp-signals.ts';
import { z } from 'zod';

export function registerValidatePDPSignalsTool(server: McpServer): void {
    server.registerTool(
        'validate-pdp-signals',
        {
            title: 'Widget PDP Signals',
            description: 'Observe signals exposed by the Magento product detail page',
            inputSchema: {
                url: z.string().url().describe(
                    'URL of the product detail page to inspect'
                )
            }
        },
        async ({ url }) => {
            const result = await probePdpSignals(url);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
    );
}