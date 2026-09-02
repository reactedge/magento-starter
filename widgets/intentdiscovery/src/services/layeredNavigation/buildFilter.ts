import type { MagentoProductFilter } from "../../types/domain/selection.filter.ts";
import { intentToFilter } from "../../lib/option-match.ts";
import type { IntentEngineState } from "../../integration/intent/types.ts";

export const getCategoryFilter = (categoryIds: string[]) => {
    const filter: MagentoProductFilter = {
        category_id: {
            in: categoryIds
        }
    };

    return filter
}

export const getAttributesFilter = (categoryIds: string[], intentState?: IntentEngineState) => {
    const filter = getCategoryFilter(categoryIds)
    const intentFilter = intentToFilter(intentState);

    Object.entries(intentFilter).forEach(([attribute, value]) => {
        if (!Array.isArray(value)) {
            filter[attribute] = { eq: value };
            return;
        }

        if (value.length === 0) {
            return;
        }

        if (value.length === 1) {
            const [selectedValue] = value;

            if (selectedValue !== undefined) {
                filter[attribute] = { eq: selectedValue };
            }

            return;
        }

        filter[attribute] = { in: value };
    });

    return filter
}