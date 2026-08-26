import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

import { registerUspResource } from './resources/usp';
import { registerProductGalleryResource } from './resources/productGallery';
import {registerMegaMenuResource} from "./resources/megamenu";
import {registerValidateContractTool} from "./tools/validateContract";
import {registerValidateStructureTool} from "./tools/validateStructure";
import { registerListWidgetsTool } from './tools/listWidgets';
import { registerCreateWidgetTool} from './tools/createWidget'

function createServer() {
    const server = new McpServer({
        name: 'reactedge',
        version: '1.0.0',
    });

    registerUspResource(server);
    registerProductGalleryResource(server);
    registerMegaMenuResource(server)

    registerValidateContractTool(server)
    registerValidateStructureTool(server)
    registerListWidgetsTool(server);
    registerCreateWidgetTool(server);

    return server;
}

serveStdio(createServer);