import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { registerValidatePDPSignalsTool } from "./tools/signal-validation"
import {loadConfig} from "./config.ts";

function createServer() {
    loadConfig();

    const server = new McpServer({
        name: 'magento-mcp',
        version: '1.0.0',
    });

    registerValidatePDPSignalsTool(server)

    return server;
}

serveStdio(createServer);