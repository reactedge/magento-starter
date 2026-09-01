import type {IntentEngineState} from "../integration/intent/types.ts";
import type {MergedAttributeOption} from "../hooks/infra/useMagentoLayeredData.tsx";
import type { MergedAttribute} from "../../types/infra/magento/attribute.types.ts";

export function enrichWithIntent(attribute: MergedAttribute, intent: IntentEngineState) {
    const intentScores =
        intent?.attributeScore?.[attribute.attribute_code] || {};

    return {
        ...attribute,
        options: attribute.options.map((option: MergedAttributeOption) => {
            const score = intentScores[option.value] || 0;

            return {
                ...option,
                intentScore: score,
                isBoosted: score > 0,
            };
        }),
    };
}

export function intentToFilter(intentState?: IntentEngineState) {
    if (intentState === undefined) {
        return {}
    }

    const { attributeScore } = intentState;

    const filter: Record<string, string[]> = {};

    for (const [attribute, options] of Object.entries(attributeScore)) {
        if (!options) continue;

        const values = Object.entries(options)
            .filter(([,score]) => score > 0)
            .map(([value]) => value);

        if (values.length > 0) {
            filter[attribute] = values;
        }
    }

    return filter;
}