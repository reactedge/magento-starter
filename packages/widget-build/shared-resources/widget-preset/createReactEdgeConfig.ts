export function createWidgetBuildDefaults<TBuild>(
    options: {
        widgetName: string;
        version: string;
        entry: string;
        outDir: string;
        emitCss?: boolean;
    }
): TBuild {
    const {widgetName, version, entry, outDir, emitCss } = options;

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
                inlineDynamicImports: true,
                assetFileNames: `widget-${widgetName}.[ext]`,
            },
        },
        minify: true,
        sourcemap: false
    } as TBuild
}

export function createNpmBuildDefaults<TBuild>({
   widgetName,
   entry,
   outDir,
   emitCss
}: {
    widgetName: string;
    entry: string;
    outDir: string;
    emitCss?: boolean;
}): TBuild {
    return {
        outDir,
        emptyOutDir: false,
        lib: {
            entry,
            formats: ["es"],
            fileName: () => "index.js",
            ...(emitCss && {
                cssFileName: `widget-${widgetName}`,
            }),
        },
        rollupOptions: {
            external: [
                "react",
                "react-dom",
                "react-dom/client",
                "react-dom/server",
                "react/jsx-runtime",
            ],
            output: {
                inlineDynamicImports: true,
            },
        },
    } as TBuild
}