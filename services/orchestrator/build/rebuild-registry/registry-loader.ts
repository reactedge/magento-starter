/**
 * Loads, validates, and exposes the widget registry. Responsible for reading widgets-dev.json.
 */

import fs from "fs";
import {RegistrySchema} from "./schema.ts";
import {getRegistryPath} from "../paths.ts";
import type {BuildWidgetRegistry} from "@reactedge/framework/contracts/buiild/BuildWidgetRegistry.ts";

export function loadRegistry(): BuildWidgetRegistry {
    const registryPath = getRegistryPath();

    const rawRegistry = JSON.parse(
        fs.readFileSync(registryPath, 'utf-8')
    );

    return RegistrySchema.parse(rawRegistry);
}

export function resolveWidgets(
    selected: string[],
    registry: BuildWidgetRegistry
): string[] {
    const expanded = new Set<string>();

    for (const widget of selected) {
        expanded.add(widget);

        for (const [name, entry] of Object.entries(registry)) {
            if (entry.widget === widget) {
                expanded.add(name);
            }
        }
    }

    return [...expanded];
}

export function resolveWidgetEntry(name: string, registry: BuildWidgetRegistry) {
    const entry = registry[name];

    if (!entry) {
        throw new Error(`Widget "${name}" not found`);
    }

    if (entry.widget) {
        const base = registry[entry.widget];

        if (!base) {
            throw new Error(`Base widget "${entry.widget}" not found`);
        }

        return {
            ...base,
            ...entry, // override
        };
    }

    return entry;
}
