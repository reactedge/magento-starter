import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { McpServer } from "@modelcontextprotocol/server";

import { registerListWidgetsTool } from "../tools/listWidgets";
import { registerValidateContractTool } from "../tools/validateContract";
import { registerValidateStructureTool } from "../tools/validateStructure";
import { registerWidgetResource } from "../resources/capability";

type ToolHandler = (input: Record<string, unknown>) => Promise<unknown>;
type ResourceHandler = (uri: URL) => Promise<unknown>;

type ToolRegistration = {
    name: string;
    config: {
        title?: string;
        description?: string;
        inputSchema?: Record<string, unknown>;
    };
    handler: ToolHandler;
};

type ResourceRegistration = {
    name: string;
    uri: string;
    config: {
        title?: string;
        description?: string;
        mimeType?: string;
    };
    handler: ResourceHandler;
};

class RecordingServer {
    readonly tools = new Map<string, ToolRegistration>();
    readonly resources = new Map<string, ResourceRegistration>();

    registerTool(
        name: string,
        config: ToolRegistration["config"],
        handler: ToolHandler,
    ): void {
        this.tools.set(name, { name, config, handler });
    }

    registerResource(
        name: string,
        uri: string,
        config: ResourceRegistration["config"],
        handler: ResourceHandler,
    ): void {
        this.resources.set(name, {
            name,
            uri,
            config,
            handler,
        });
    }

    asMcpServer(): McpServer {
        return this as unknown as McpServer;
    }
}

function getTool(
    server: RecordingServer,
    name: string,
): ToolRegistration {
    const tool = server.tools.get(name);
    assert.ok(tool, `Expected MCP tool "${name}" to be registered`);
    return tool;
}

function textPayload(result: unknown): Record<string, unknown> {
    assert.ok(result && typeof result === "object");

    const content = (result as {
        content?: Array<{ type?: string; text?: string }>;
    }).content;

    assert.ok(Array.isArray(content));
    assert.equal(content.length, 1);
    assert.equal(content[0]?.type, "text");
    assert.equal(typeof content[0]?.text, "string");

    return JSON.parse(content[0]!.text!);
}

test("list_widgets exposes the current public tool contract", () => {
    const server = new RecordingServer();
    registerListWidgetsTool(server.asMcpServer());

    const tool = getTool(server, "list_widgets");

    assert.equal(tool.config.title, "List ReactEdge widgets");
    assert.equal(
        tool.config.description,
        "Lists the ReactEdge widgets available in the current repository.",
    );
    assert.deepEqual(tool.config.inputSchema, {});
});

test("list_widgets returns the current deterministic, sorted widget payload", async () => {
    const server = new RecordingServer();
    registerListWidgetsTool(server.asMcpServer());

    const result = await getTool(server, "list_widgets").handler({});
    const payload = textPayload(result);

    assert.equal(typeof payload.count, "number");
    assert.ok(Array.isArray(payload.widgets));
    assert.equal(payload.count, payload.widgets.length);

    const widgets = payload.widgets as Array<Record<string, unknown>>;

    for (const widget of widgets) {
        assert.deepEqual(Object.keys(widget), ["id"]);
        assert.equal(typeof widget.id, "string");
        assert.ok((widget.id as string).length > 0);
    }

    const ids = widgets.map(widget => widget.id as string);
    assert.deepEqual(ids, [...ids].sort((a, b) => a.localeCompare(b)));
    assert.equal(new Set(ids).size, ids.length);
});

test("validate_contract exposes the current public tool contract", () => {
    const server = new RecordingServer();
    registerValidateContractTool(server.asMcpServer());

    const tool = getTool(server, "validate_contract");

    assert.equal(tool.config.title, "Validate ReactEdge widget contract");
    assert.equal(
        tool.config.description,
        "Validates a configuration against the authoritative ReactEdge widget schema.",
    );
    assert.deepEqual(
        Object.keys(tool.config.inputSchema ?? {}).sort(),
        ["contract", "widget"],
    );
});

test("validate_contract rejects path traversal as a controlled MCP error", async () => {
    const server = new RecordingServer();
    registerValidateContractTool(server.asMcpServer());

    const result = await getTool(server, "validate_contract").handler({
        widget: "../../etc/passwd",
        contract: {},
    }) as { isError?: boolean };

    assert.equal(result.isError, true);

    const payload = textPayload(result);
    assert.equal(payload.widget, "../../etc/passwd");
    assert.equal(payload.valid, false);
    assert.equal(payload.error, "Invalid widget name: ../../etc/passwd");
});

test("validate_contract reports an unknown widget without crashing the server", async () => {
    const server = new RecordingServer();
    registerValidateContractTool(server.asMcpServer());

    const result = await getTool(server, "validate_contract").handler({
        widget: "definitely-not-a-reactedge-widget",
        contract: {},
    }) as { isError?: boolean };

    assert.equal(result.isError, true);

    const payload = textPayload(result);
    assert.equal(payload.widget, "definitely-not-a-reactedge-widget");
    assert.equal(payload.valid, false);
    assert.equal(payload.error, "Unknown widget: definitely-not-a-reactedge-widget");
});

test("validate_structure exposes the current public tool contract", () => {
    const server = new RecordingServer();
    registerValidateStructureTool(server.asMcpServer());

    const tool = getTool(server, "validate_structure");

    assert.equal(tool.config.title, "Validate ReactEdge widget structure");
    assert.equal(
        tool.config.description,
        "Validates a widget byte-for-byte against the canonical ReactEdge structure.",
    );
    assert.deepEqual(Object.keys(tool.config.inputSchema ?? {}), ["widget"]);
});

test("a widget capability is exposed through the reactedge resource contract", async () => {
    const widget = "usp";
    const server = new RecordingServer();

    registerWidgetResource(server.asMcpServer(), widget);

    const resource = server.resources.get(widget);
    assert.ok(resource);
    assert.equal(resource.uri, `reactedge://widgets/${widget}`);
    assert.equal(resource.config.mimeType, "application/json");

    const capabilityPath = resolve(
        process.cwd(),
        "widgets",
        widget,
        "capability.json",
    );
    const capability = JSON.parse(
        await readFile(capabilityPath, "utf8"),
    ) as Record<string, unknown>;

    assert.equal(resource.config.title, capability.title ?? widget);
    assert.equal(resource.config.description, capability.description);

    const result = await resource.handler(
        new URL(`reactedge://widgets/${widget}`),
    ) as {
        contents?: Array<{
            uri?: string;
            mimeType?: string;
            text?: string;
        }>;
    };

    assert.ok(Array.isArray(result.contents));
    assert.equal(result.contents.length, 1);
    assert.equal(result.contents[0]?.uri, `reactedge://widgets/${widget}`);
    assert.equal(result.contents[0]?.mimeType, "application/json");
    assert.deepEqual(JSON.parse(result.contents[0]!.text!), capability);
});

test("the canonical widget scaffold remains on the repository Vite major", async () => {
    const rootPackage = JSON.parse(
        await readFile(resolve(process.cwd(), "package.json"), "utf8"),
    ) as {
        devDependencies?: { vite?: string };
    };

    const templatePackage = JSON.parse(
        await readFile(
            resolve(
                process.cwd(),
                "packages/widget-template/package.json.template",
            ),
            "utf8",
        ),
    ) as {
        devDependencies?: { vite?: string };
    };

    const rootVite = rootPackage.devDependencies?.vite;
    const templateVite = templatePackage.devDependencies?.vite;

    assert.equal(typeof rootVite, "string");
    assert.equal(typeof templateVite, "string");

    const major = (version: string): string | undefined =>
        version.match(/\d+/)?.[0];

    assert.equal(
        major(templateVite!),
        major(rootVite!),
        `Widget scaffold Vite ${templateVite} has drifted from root Vite ${rootVite}`,
    );
});
