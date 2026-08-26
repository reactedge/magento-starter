import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { cp, mkdir, readFile, writeFile, access, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve, join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const WidgetTypeSchema = z.enum(["standard", "runtime"]);

function toPascalCase(value: string): string {
    return value
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map(
            part =>
                part.charAt(0).toUpperCase() +
                part.slice(1).toLowerCase()
        )
        .join("");
}

import {
    readFile,
    writeFile,
    readdir,
    rename,
} from "node:fs/promises";

async function replaceWidgetTokensInDirectory(
    directory: string,
    widgetName: string
): Promise<void> {
    const entries = await readdir(directory, {
        withFileTypes: true,
    });

    for (const entry of entries) {
        const originalPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            await replaceWidgetTokensInDirectory(
                originalPath,
                widgetName
            );
        }

        if (entry.isFile()) {
            const content = await readFile(
                originalPath,
                "utf8"
            );

            const updated = replaceWidgetTokens(
                content,
                widgetName
            );

            if (updated !== content) {
                await writeFile(
                    originalPath,
                    updated,
                    "utf8"
                );
            }
        }

        const renamedEntry = replaceWidgetTokens(
            entry.name,
            widgetName
        );

        if (renamedEntry !== entry.name) {
            await rename(
                originalPath,
                join(directory, renamedEntry)
            );
        }
    }
}

function replaceWidgetTokens(
    content: string,
    widgetName: string
): string {
    const pascalName = toPascalCase(widgetName);

    return content
        .replaceAll(
            "__WIDGET_PASCAL_NAME__",
            pascalName
        )
        .replaceAll(
            "__WIDGET_NAME__",
            widgetName
        );
}

export function registerCreateWidgetTool(server: McpServer) {
    server.registerTool(
        "create_widget",
        {
            title: 'Create a new ReactEdge widget',
            description: "Create a new ReactEdge widget from a canonical template.",
            inputSchema: {
                name: z.string().min(1),
                type: WidgetTypeSchema,
            },
        },
        async ({ name, type }) => {
            const root = process.cwd();

            const templateRoot = resolve(
                root,
                "packages/widget-template"
            );

            const templateDirectory = resolve(
                templateRoot,
                type
            );

            const packageTemplate = resolve(
                templateRoot,
                "package.json.template"
            );

            const widgetDirectory = resolve(
                root,
                "widgets",
                name
            );

            try {
                await access(widgetDirectory, constants.F_OK);

                return {
                    isError: true,
                    content: [{
                        type: "text",
                        text: `Widget "${name}" already exists.`,
                    }],
                };
            } catch {
                // Expected: widget does not exist.
            }

            await mkdir(widgetDirectory, {
                recursive: false,
            });

            await cp(
                templateDirectory,
                widgetDirectory,
                {
                    recursive: true,
                }
            );

            await replaceWidgetTokensInDirectory(
                widgetDirectory,
                name
            );

            const packageTemplateContent = await readFile(
                packageTemplate,
                "utf8"
            );

            const packageJson = packageTemplateContent
                .replaceAll("__WIDGET_NAME__", name);

            await writeFile(
                resolve(widgetDirectory, "package.json"),
                packageJson
            );

            await execFileAsync(
                "npm",
                ["install"],
                {
                    cwd: widgetDirectory,
                }
            );

            return {
                content: [{
                    type: "text",
                    text:
                        `Created ${type} widget "${name}" ` +
                        `in widgets/${name}.`,
                }],
            };
        }
    );
}