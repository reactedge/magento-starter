import type { MergedAttribute } from "../../types/infra/magento/attribute.types.ts";
import type { IntentLike } from "../../types/domain/selection.preference.ts"

export function isAttributeSelected(
    attributeCode: string,
    intent?: IntentLike
): boolean {
    if (intent?.attributeScore && attributeCode in intent.attributeScore) {
        return true;
    }

    if (
        attributeCode === "price" &&
        intent?.priceAffinity &&
        Object.keys(intent.priceAffinity).length > 0
    ) {
        return true;
    }

    return false;
}

export function getSelectedValues(
    attributeCode: string,
    aggregations: MergedAttribute[],
    intent?: IntentLike
): string[] {
    const scores = intent?.attributeScore?.[attributeCode];
    if (!scores) return [];

    const aggregation = aggregations.find(a => a.code === attributeCode);

    return Object.entries(scores)
        .map(([val]) => {
            const option = aggregation?.options.find(o => String(o.value) === String(val));
            const label = option?.label ?? val;

            return label;
        })
}

export function getSelectedAttributes(
    aggregations: MergedAttribute[] | undefined,
    intent?: IntentLike
) {
    return (
        aggregations?.filter((attr: MergedAttribute) =>
            isAttributeSelected(attr.code, intent)
        ) || []
    );
}

export function useSelectedPreferences(
    attributes: MergedAttribute[],
    intent?: IntentLike
) {
    const selected = getSelectedAttributes(attributes, intent);

    const valueFor = (code: string): string | null => {
        const scores = intent?.attributeScore?.[code];
        if (!scores) return null;

        const [bestValue] =
            Object.entries(scores)
                .sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0] || [];

        if (!bestValue) return null;

        const aggregation = attributes.find(a => a.code === code);
        if (!aggregation) return null;

        const valid = aggregation.options.find(o => String(o.value) === String(bestValue));

        return valid ? String(valid.value) : null;
    };

    const displayFor = (code: string): string[] => {
        return getSelectedValues(code, attributes, intent);
    };

    return { selected, valueFor, displayFor };
}