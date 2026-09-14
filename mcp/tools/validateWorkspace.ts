import type { McpServer } from '@modelcontextprotocol/server';
import {StoreWorkspaceValidator} from "../../packages/widget-validation";
import {ReactEdgeRoot} from "@reactedge/filesystem/reactedgeRoot";
import {getConfig} from "../config";

export function registerValidateWorkspaceTool(server: McpServer) {
    const validator = new StoreWorkspaceValidator(
        ReactEdgeRoot.get()
    );

    const CONFIG = getConfig()

    server.registerTool(
        'validate_workspace',
        {
            title: 'Validate ReactEdge workspace',
            description:
                `Validates ReactEdge workspace ${CONFIG.storeCode}.`,
        },

        async () => ({
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        validator.validate(CONFIG.storeCode, CONFIG.targetSiteUrl),
                        null,
                        2,
                    ),
                },
            ],
        }),
    );
}