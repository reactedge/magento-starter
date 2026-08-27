import type { McpServer } from "@modelcontextprotocol/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ReactEdgeRoot } from "@reactedge/filesystem/reactedgeRoot";

export function registerWidgetResource(
    server: McpServer,
    widget: string,
) {
    const widgetRoot = resolve(
        ReactEdgeRoot.get(),
        'widgets',
        widget
    );

    const capability = JSON.parse(
        readFileSync(
            resolve(widgetRoot, "capability.json"),
            "utf8",
        ),
    );

    server.registerResource(
        widget,
        `reactedge://widgets/${widget}`,
        {
            title: capability.title ?? widget,
            description: capability.description,
            mimeType: "application/json",
        },
        async uri => ({
            contents: [{
                uri: uri.href,
                mimeType: "application/json",
                text: JSON.stringify(capability, null, 2),
            }],
        }),
    );
}