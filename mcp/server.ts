import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { registerValidateContractTool } from "./tools/validateContract";
import { registerValidateStructureTool } from "./tools/validateStructure";
import { registerListWidgetsTool } from './tools/listWidgets';
import { registerCreateWidgetTool } from './tools/createWidget';
import { registerWidgetResource } from './resources/capability';
import { WidgetRegistry } from "../packages/widget-registry";
import { ReactEdgeRoot } from "@reactedge/filesystem/reactedgeRoot";
import {registerValidateWorkspaceTool} from "./tools/validateWorkspace";
import {loadConfig} from "./config";

const requestedEnvironment =
    process.argv[2] ?? "default";

loadConfig(requestedEnvironment);

function createServer() {
    const server = new McpServer({
        name: 'reactedge',
        version: '1.0.0',
    });

    const registry = new WidgetRegistry(
        ReactEdgeRoot.get()
    );

    for (const capability of registry.list()) {
        registerWidgetResource(server, capability.id);
    }

    registerValidateContractTool(server)
    registerValidateStructureTool(server)
    registerValidateWorkspaceTool(server)
    registerListWidgetsTool(server);
    registerCreateWidgetTool(server);

    return server;
}

serveStdio(createServer);