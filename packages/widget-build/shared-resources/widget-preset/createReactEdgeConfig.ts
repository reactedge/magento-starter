export function createWidgetBuildDefaults<TBuild>(
    options: {
        widgetName: string;
        version: string;
        entry: string;
        outDir: string;
        emitCss?: boolean;
        sourcemap?: boolean
    }
): TBuild {
    const {widgetName, version, entry, outDir, emitCss, sourcemap } = options;

    return {
        outDir,
        cssCodeSplit: false,
        emptyOutDir: false,
        lib: {
            entry,
            name: `ReactEdge_${widgetName}`,
            fileName: () => `widget-${widgetName}@${version}.iife.js`,
            ...(emitCss && {
                cssFileName: `widget-${widgetName}`,
            }),
            formats: ["iife"],
        },
        rollupOptions: {
            output: {
                assetFileNames: `widget-${widgetName}.[ext]`,
            },
        },
        minify: true,
        sourcemap: sourcemap?? false
    } as TBuild
}

export function createNpmBuildDefaults<TBuild>({
   widgetName,
}: {
    widgetName: string;
}): TBuild {
    return {
        outDir: `../../workspace/release/source/${widgetName}/`,
        emptyOutDir: false,
        lib: {
            entry: "api/index.ts",
            formats: ["es"],
            fileName: () => "index.js",
        },
        rollupOptions: {
            external: [
                "react",
                "react-dom",
                "react-dom/client",
                "react-dom/server",
                "react/jsx-runtime",
            ],
        },
    } as TBuild
}