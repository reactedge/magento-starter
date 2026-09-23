import test from "node:test";
import assert from "node:assert/strict";
import {
    cp,
    mkdtemp,
    mkdir,
    readFile,
    readdir,
    rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { McpServer } from "@modelcontextprotocol/server";

import { registerValidateStructureTool } from "../tools/validateStructure";

const execFileAsync = promisify(execFile);

type ToolHandler = (input: Record<string, unknown>) => Promise<unknown>;

type ToolRegistration = {
    name: string;
    handler: ToolHandler;
};

class RecordingServer {
    readonly tools = new Map<string, ToolRegistration>();

    registerTool(
        name: string,
        _config: unknown,
        handler: ToolHandler,
    ): void {
        this.tools.set(name, { name, handler });
    }

    asMcpServer(): McpServer {
        return this as unknown as McpServer;
    }
}

function textPayload(result: unknown): string {
    assert.ok(result && typeof result === "object");

    const content = (result as {
        content?: Array<{ type?: string; text?: string }>;
    }).content;

    assert.ok(Array.isArray(content));
    assert.equal(content.length, 1);
    assert.equal(content[0]?.type, "text");
    assert.equal(typeof content[0]?.text, "string");

    return content[0]!.text!;
}

function jsonPayload(result: unknown): Record<string, unknown> {
    return JSON.parse(textPayload(result));
}

async function createTemporaryRepository(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), "reactedge-mcp-create-"));

    await mkdir(resolve(root, "packages"), { recursive: true });
    await mkdir(resolve(root, "widgets"), { recursive: true });

    await cp(
        resolve(process.cwd(), "packages/widget-template"),
        resolve(root, "packages/widget-template"),
        { recursive: true },
    );

    await cp(
        resolve(process.cwd(), "packages/widget-build"),
        resolve(root, "packages/widget-build"),
        { recursive: true },
    );

    return root;
}

async function loadCreateWidgetTool(): Promise<(
    server: McpServer,
) => void> {
    const module = await import("../tools/createWidget");
    return module.registerCreateWidgetTool;
}

async function invokeCreateWidget(
    root: string,
    name: string,
    type: "standard" | "runtime" | "runtime-shadow",
): Promise<unknown> {
    const originalCwd = process.cwd();

    try {
        process.chdir(root);

        const server = new RecordingServer();
        const registerCreateWidgetTool = await loadCreateWidgetTool();
        registerCreateWidgetTool(server.asMcpServer());

        const tool = server.tools.get("create_widget");
        assert.ok(tool, "Expected create_widget to be registered");

        return await tool.handler({ name, type });
    } finally {
        process.chdir(originalCwd);
    }
}

async function validateGeneratedWidget(
    root: string,
    widget: string,
): Promise<Record<string, unknown>> {
    const originalRoot = process.env.REACTEDGE_ROOT;

    try {
        process.env.REACTEDGE_ROOT = root;

        const server = new RecordingServer();
        registerValidateStructureTool(server.asMcpServer());

        const tool = server.tools.get("validate_structure");
        assert.ok(tool);

        return jsonPayload(await tool.handler({ widget }));
    } finally {
        if (originalRoot === undefined) {
            delete process.env.REACTEDGE_ROOT;
        } else {
            process.env.REACTEDGE_ROOT = originalRoot;
        }
    }
}

async function assertNoTemplateTokens(root: string): Promise<void> {
    const entries = await readdir(root, {
        recursive: true,
        withFileTypes: true,
    });

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const path = resolve(entry.parentPath, entry.name);
        const content = await readFile(path, "utf8");

        assert.equal(
            content.includes("__WIDGET_NAME__"),
            false,
            `Unreplaced __WIDGET_NAME__ token in ${path}`,
        );
        assert.equal(
            content.includes("__WIDGET_PASCAL_NAME__"),
            false,
            `Unreplaced __WIDGET_PASCAL_NAME__ token in ${path}`,
        );
    }
}

for (const variant of ["standard", "runtime", "runtime-shadow"] as const) {
    test(
        `create_widget produces a structurally valid and buildable ${variant} widget`,
        { timeout: 120_000 },
        async () => {
            const root = await createTemporaryRepository();
            const name = `mcp-${variant.replaceAll("-", "")}`;

            try {
                const result = await invokeCreateWidget(root, name, variant);

                assert.equal(
                    textPayload(result),
                    `Created ${variant} widget "${name}" in widgets/${name}.`,
                );

                const widgetRoot = resolve(root, "widgets", name);
                const packageJson = JSON.parse(
                    await readFile(resolve(widgetRoot, "package.json"), "utf8"),
                ) as { name?: string };

                assert.equal(packageJson.name, `widget-${name}`);
                await assertNoTemplateTokens(widgetRoot);

                const validation = await validateGeneratedWidget(root, name);
                assert.equal(validation.variant, variant);
                assert.equal(validation.valid, true);
                assert.deepEqual(validation.missing, []);
                assert.deepEqual(validation.canonicalMissing, []);
                assert.deepEqual(validation.modified, []);

                await execFileAsync("npm", ["run", "build"], {
                    cwd: widgetRoot,
                    timeout: 60_000,
                    env: process.env,
                });
            } finally {
                await rm(root, { recursive: true, force: true });
            }
        },
    );
}

test(
    "create_widget refuses to overwrite an existing widget",
    { timeout: 120_000 },
    async () => {
        const root = await createTemporaryRepository();
        const name = "mcp-existing";

        try {
            const first = await invokeCreateWidget(root, name, "standard");
            assert.equal(
                textPayload(first),
                `Created standard widget "${name}" in widgets/${name}.`,
            );

            const second = await invokeCreateWidget(root, name, "standard") as {
                isError?: boolean;
            };

            assert.equal(second.isError, true);
            assert.equal(
                textPayload(second),
                `Widget "${name}" already exists.`,
            );
        } finally {
            await rm(root, { recursive: true, force: true });
        }
    },
);
