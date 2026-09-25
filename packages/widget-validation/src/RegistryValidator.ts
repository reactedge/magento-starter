import {
    existsSync,
    readFileSync,
} from "node:fs";
import {relative, resolve} from "node:path";
import type {
    RegistryWidgetEntry,
    WorkspaceValidationIssue,
} from "./WorkspaceValidation";

interface RegistryEntry {
    widget?: unknown;
    contract?: unknown;
}

export interface RegistryValidationResult {
    widgets: RegistryWidgetEntry[];
    issues: WorkspaceValidationIssue[];
}

export class RegistryValidator {
    validate(storeRoot: string): RegistryValidationResult {
        const registryFile = resolve(storeRoot, "registry.json");

        if (!existsSync(registryFile)) {
            return {
                widgets: [],
                issues: [{
                    type: "missing-registry",
                    file: "registry.json",
                    message: "Workspace registry.json does not exist.",
                }],
            };
        }

        let registry: unknown;

        try {
            registry = JSON.parse(
                readFileSync(registryFile, "utf8"),
            );
        } catch (error) {
            return {
                widgets: [],
                issues: [{
                    type: "invalid-registry",
                    file: "registry.json",
                    message:
                        error instanceof Error
                            ? `Unable to parse workspace registry: ${error.message}`
                            : "Unable to parse workspace registry.",
                }],
            };
        }

        if (registry === null ||
            Array.isArray(registry) ||
            typeof registry !== "object") {
            return {
                widgets: [],
                issues: [{
                    type: "invalid-registry",
                    file: "registry.json",
                    message: "Workspace registry must be a JSON object.",
                }],
            };
        }

        const widgets: RegistryWidgetEntry[] = [];
        const issues: WorkspaceValidationIssue[] = [];

        for (const [instance, rawEntry] of Object.entries(registry)) {
            if (rawEntry === null ||
                Array.isArray(rawEntry) ||
                typeof rawEntry !== "object") {
                issues.push({
                    type: "invalid-registry",
                    instance,
                    file: "registry.json",
                    path: instance,
                    message: `Registry entry "${instance}" must be an object.`,
                });
                continue;
            }

            const entry = rawEntry as RegistryEntry;
            const widget = typeof entry.widget === "string"
                ? entry.widget
                : instance;

            if (typeof entry.contract !== "string" ||
                entry.contract.length === 0) {
                issues.push({
                    type: "missing-contract",
                    widget,
                    instance,
                    file: "registry.json",
                    path: `${instance}.contract`,
                    message:
                        `Registry entry "${instance}" does not reference a contract file.`,
                });
                continue;
            }

            const contractDirectory = resolve(
                storeRoot,
                "contracts",
                widget,
            );

            if (!existsSync(contractDirectory)) {
                issues.push({
                    type: "missing-contract-directory",
                    widget,
                    instance,
                    file: relative(storeRoot, contractDirectory),
                    message:
                        `Registry entry "${instance}" maps to widget "${widget}", ` +
                        "but its contract directory does not exist.",
                });
                continue;
            }

            const contractPath = resolve(
                contractDirectory,
                entry.contract,
            );

            if (!existsSync(contractPath)) {
                issues.push({
                    type: "missing-contract",
                    widget,
                    instance,
                    file: relative(storeRoot, contractPath),
                    message:
                        `Contract "${entry.contract}" referenced by ` +
                        `registry entry "${instance}" does not exist.`,
                });
                continue;
            }

            widgets.push({
                instance,
                widget,
                contractFile: entry.contract,
            });
        }

        return {
            widgets,
            issues,
        };
    }
}
