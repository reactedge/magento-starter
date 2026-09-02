import type { IntentDiscoveryDataConfig } from "../types/domain/intent-discovery.types.ts";
import type { MergedAttribute } from "../types/infra/magento/attribute.types.ts";
import type { AttributeFilters } from "../integration/intent/types.ts";

export function applyIntentConfig(
    attributes: MergedAttribute[],
    config: IntentDiscoveryDataConfig
): MergedAttribute[] {

    const excluded = new Set(config.attributeExcludedInLayer || []);
    const order = config.attributeOrder || [];
    const labelMap = config.labelMap || {};

    const filtered = attributes
        .filter(attr => !excluded.has(attr.code))
        .map(attr => ({
            ...attr,
            label: labelMap[attr.code] ?? attr.label
        }));

    const ordered: MergedAttribute[] = [];
    const remaining = new Map(filtered.map(a => [a.code, a]));

    for (const code of order) {
        const attr = remaining.get(code);
        if (attr) {
            ordered.push(attr);
            remaining.delete(code);
        }
    }

    return [...ordered, ...remaining.values()];
}

export function filterAttributesByConfig(
    attributes: MergedAttribute[],
    config: IntentDiscoveryDataConfig
): MergedAttribute[] {
    const excluded = new Set(config.attributeExcludedInLayer || []);

    return attributes.filter(attr => !excluded.has(attr.code));
}

export function getFiltersHash(filters: AttributeFilters) {
    return JSON.stringify(
        Object.entries(filters).sort()
    );
}
