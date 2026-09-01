import {
    existsSync,
    readFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { getWidgetType } from "@reactedge/widget-preset/widgetType";

const requiredFiles = {
    standard: [
        "src/Config.ts",
        "src/ConfigSchema.ts",
        "src/WidgetView.tsx",
        "src/bootstrap/WidgetWrapper.tsx",
    ],
    runtime: [
        "src/Config.ts",
        "src/ConfigSchema.ts",
        "src/ConfigSchemaRuntime.ts",
        "src/WidgetView.tsx",
        "src/bootstrap/WidgetWrapper.tsx",
    ],
} as const;

const sharedFiles = [
    "vite.npm.config.ts",
    "vite.config.ts",
    "tsconfig.node.json",
    "tsconfig.json",
    "tsconfig.app.json",

    "api/index.ts",

    "src/entrypoints/npm.tsx",
    "src/entrypoints/ssr.tsx",

    "src/Widget.tsx",

    "src/bootstrap/widget-root.tsx",
    "src/bootstrap/widget-ssr-component.tsx",

    "src/activity/Context/ActivityContextProvider.tsx",
    "src/activity/Context/ActivityContext.tsx",
    "src/activity/Context/useActivityContext.ts",
] as const;

const variantFiles = {
    standard: [
        "api/widget.tsx",
    ],
    runtime: [
        "api/runtime-widget.tsx",
        "public/reactedge-runtime.json",
    ],
} as const;

export interface WidgetStructureValidationResult {
    widget: string;
    variant?: string;
    valid: boolean;
    error?: string;
    missing?: string[];
    canonicalMissing?: string[];
    modified?: string[];
}

export class WidgetStructureValidator {
    private readonly repositoryRoot: string;

    constructor(repositoryRoot: string) {
        this.repositoryRoot = repositoryRoot;
    }

    validate(widget: string): WidgetStructureValidationResult {
        const widgetRoot = resolve(
            this.repositoryRoot,
            "widgets",
            widget,
        );

        if (!existsSync(widgetRoot)) {
            return {
                widget,
                valid: false,
                error: `Unknown widget: ${widget}`,
            };
        }

        const variant = getWidgetType(widgetRoot);

        const canonicalRoot = resolve(
            this.repositoryRoot,
            "packages",
            "widget-template",
            variant,
        );

        if (!existsSync(canonicalRoot)) {
            return {
                widget,
                variant,
                valid: false,
                error: `Canonical ${variant} template not found`,
            };
        }

        const missing = this.findMissingFiles(
            widgetRoot,
            requiredFiles[variant],
        );

        const canonicalFiles = [
            ...sharedFiles,
            ...variantFiles[variant],
        ];

        const comparison = this.compareCanonicalFiles(
            widgetRoot,
            canonicalRoot,
            canonicalFiles,
        );

        return {
            widget,
            variant,
            valid:
                missing.length === 0 &&
                comparison.missing.length === 0 &&
                comparison.canonicalMissing.length === 0 &&
                comparison.modified.length === 0,

            missing: [
                ...missing,
                ...comparison.missing,
            ],
            canonicalMissing: comparison.canonicalMissing,
            modified: comparison.modified,
        };
    }

    private findMissingFiles(
        root: string,
        files: readonly string[],
    ): string[] {
        return files.filter(
            file => !existsSync(resolve(root, file)),
        );
    }

    private compareCanonicalFiles(
        widgetRoot: string,
        canonicalRoot: string,
        files: readonly string[],
    ) {
        const missing: string[] = [];
        const canonicalMissing: string[] = [];
        const modified: string[] = [];

        for (const file of files) {
            const actual = resolve(widgetRoot, file);
            const canonical = resolve(canonicalRoot, file);

            if (!existsSync(actual)) {
                missing.push(file);
                continue;
            }

            if (!existsSync(canonical)) {
                canonicalMissing.push(file);
                continue;
            }

            if (!this.filesMatch(actual, canonical)) {
                modified.push(file);
            }
        }

        return {
            missing,
            canonicalMissing,
            modified,
        };
    }

    private filesMatch(
        actual: string,
        canonical: string,
    ): boolean {
        return readFileSync(actual)
            .equals(readFileSync(canonical));
    }
}