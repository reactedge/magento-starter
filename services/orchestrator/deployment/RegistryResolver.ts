import type { BuildWidgetRegistry } from "@reactedge/framework/contracts/buiild/BuildWidgetRegistry.ts";

export class RegistryResolver {
    resolveWidgets(
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

    resolveWidgetEntry(
        name: string,
        registry: BuildWidgetRegistry
    ) {
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
                ...entry,
            };
        }

        return entry;
    }
}
