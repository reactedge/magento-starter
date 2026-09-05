import fs from "fs";
import path from "path";
import type {
    OutputBundle,
    OutputOptions,
} from "rollup";

type Options = {
    widgetName: string;
    version: string;
    css: boolean;
};

export function npmManifestPlugin({
                                      widgetName,
                                      version,
                                      css,
                                  }: Options) {
    return {
        name: "reactedge-npm-manifest-plugin",
        apply: "build" as const,

        generateBundle(
            options: OutputOptions,
            bundle: OutputBundle
        ) {
            const entry = Object.entries(bundle).find(
                ([, output]) =>
                    output.type === "chunk" &&
                    output.isEntry
            );

            if (!entry) {
                throw new Error(
                    `No NPM entry found for widget "${widgetName}"`
                );
            }

            const [filename] = entry;

            const manifest = {
                widget: widgetName,
                version,
                filename,
                ...(css && {
                    cssFilename: `widget-${widgetName}.css`,
                }),
                built_at: new Date().toISOString(),
            };

            const outDir = options.dir ?? "www";

            const manifestPath = path.join(
                outDir,
                `widget-${widgetName}.manifest.json`
            );

            fs.writeFileSync(
                manifestPath,
                JSON.stringify(manifest, null, 2)
            );
        },
    };
}