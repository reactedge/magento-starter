import type { CategoryData } from "../../types/infra/magento/category.types.ts";
import { categoryLayereIds } from "../../lib/category.ts";
import { useMemo } from "react";
import { intentToFilter } from "../../lib/option-match.ts";
import { useIntentState } from "../../state/Intent/useIntentState.ts";
import type { MagentoProductFilter } from "../../types/domain/selection.filter.ts"

export function useOptionSelectionFilter(categoryData?: CategoryData) {
    const { intentState } = useIntentState()

    const categoryIds = useMemo(
        () => categoryLayereIds(categoryData),
        [categoryData]
    );

    const intentFilter = useMemo(
        () => intentToFilter(intentState),
        [intentState]
    );

    return useMemo(() => {
        const filter: MagentoProductFilter = {
            category_id: {
                in: categoryIds
            }
        };

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
        return filter;

    }, [categoryIds, intentFilter]);
}