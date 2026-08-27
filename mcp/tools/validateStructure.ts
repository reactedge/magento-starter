import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import {WidgetStructureValidator} from "../../packages/widget-validation";
import {ReactEdgeRoot} from "@reactedge/filesystem/reactedgeRoot";

export function registerValidateStructureTool(server: McpServer) {
    const validator = new WidgetStructureValidator(
        ReactEdgeRoot.get()
    );

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

        async ({widget}) => ({
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        validator.validate(widget),
                        null,
                        2,
                    ),
                },
            ],
        }),
    );
}