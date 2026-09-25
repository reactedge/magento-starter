import {
    existsSync,
    readFileSync,
} from "node:fs";
import {relative, resolve} from "node:path";
import {pathToFileURL} from "node:url";
import type {
    RegistryWidgetEntry,
    WorkspaceValidationIssue,
} from "./WorkspaceValidation";

interface ValidationIssue {
    path: PropertyKey[];
    message: string;
}

interface SchemaResult {
    success: boolean;
    error?: {
        issues: ValidationIssue[];
    };
}

interface WidgetConfigSchema {
    safeParse(value: unknown): SchemaResult;
}

export class ContractValidator {
    constructor(
        private readonly repositoryRoot: string,
    ) {}

    async validate(
        storeRoot: string,
        entry: RegistryWidgetEntry,
    ): Promise<WorkspaceValidationIssue[]> {
        const contractPath = resolve(
            storeRoot,
            "contracts",
            entry.widget,
            entry.contractFile,
        );

        let contract: unknown;

        try {
            contract = JSON.parse(
                readFileSync(contractPath, "utf8"),
            );
        } catch (error) {
            return [{
                type: "invalid-contract",
                widget: entry.widget,
                instance: entry.instance,
                file: relative(storeRoot, contractPath),
                message:
                    error instanceof Error
                        ? `Unable to parse contract: ${error.message}`
                        : "Unable to parse contract.",
            }];
        }

        const schemaPath = resolve(
            this.repositoryRoot,
            "widgets",
            entry.widget,
            "src",
            "ConfigSchema.ts",
        );

        if (!existsSync(schemaPath)) {
            return [{
                type: "invalid-contract",
                widget: entry.widget,
                instance: entry.instance,
                file: relative(this.repositoryRoot, schemaPath),
                message:
                    `Widget "${entry.widget}" does not expose src/ConfigSchema.ts.`,
            }];
        }

        try {
            const module = await import(
                pathToFileURL(schemaPath).href
            ) as {
                WidgetConfigSchema?: WidgetConfigSchema;
            };

            if (!module.WidgetConfigSchema) {
                return [{
                    type: "invalid-contract",
                    widget: entry.widget,
                    instance: entry.instance,
                    file: relative(this.repositoryRoot, schemaPath),
                    message:
                        `Widget "${entry.widget}" does not export WidgetConfigSchema.`,
                }];
            }

            const result = module.WidgetConfigSchema.safeParse(contract);

            if (result.success) {
                return [];
            }

            return (result.error?.issues ?? []).map(issue => ({
                type: "invalid-contract" as const,
                widget: entry.widget,
                instance: entry.instance,
                file: relative(storeRoot, contractPath),
                path: issue.path.map(String).join("."),
                message: issue.message,
            }));
        } catch (error) {
            return [{
                type: "invalid-contract",
                widget: entry.widget,
                instance: entry.instance,
                file: relative(storeRoot, contractPath),
                message:
                    error instanceof Error
                        ? `Unable to validate contract: ${error.message}`
                        : "Unable to validate contract.",
            }];
        }
    }
}
