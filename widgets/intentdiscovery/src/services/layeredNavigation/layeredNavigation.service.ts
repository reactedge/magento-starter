import type { IntentEngineState } from "../../integration/intent/types.ts";
import { fetchFiltered } from "./fetchFiltered.ts";
import type { CategoryData } from "../../types/infra/magento/category.types.ts";
import { categoryLayereIds } from "../../lib/category.ts";
import type { MergedAttribute } from "../../types/infra/magento/attribute.types.ts";
import type { MagentoLayeredNavigation } from "../../types/domain/layered-data.types.ts";
import type { MagentoProducts } from "../../types/domain/layered-data.types.ts";
import type { IntentDiscoveryDataConfig } from "../../types/domain/intent-discovery.types.ts";
import { applyIntentConfig } from "../../lib/attributes.ts";
import type { GraphqlClient } from "@reactedge/framework/graphql/graphqlClient.ts";

export async function getLayeredNavigation(
    categoryData: CategoryData,
    graphqlClient: GraphqlClient,
    config: IntentDiscoveryDataConfig,
    configuredLayeredAttributes: MagentoLayeredNavigation,
    intentState?: IntentEngineState,
): Promise<MagentoLayeredNavigation> {
    const categoryIds = categoryLayereIds(categoryData)

    const filtered = await fetchFiltered(categoryIds, graphqlClient, intentState);
    const merged = mergeLayerData(configuredLayeredAttributes, filtered)
    const attributes = applyIntentConfig(merged, config);

    return {
        attributes,
        totalCount: filtered.total_count,
        baseTotalCount: configuredLayeredAttributes.totalCount
    }
}

export function mergeLayerData(
    configuredLayer: MagentoLayeredNavigation,
    filtered: MagentoProducts
): MergedAttribute[] {
    const baseAggregations = configuredLayer?.attributes ?? [];
    const filteredAggregations = filtered?.aggregations ?? []

    const filteredMap = new Map(
        filteredAggregations.map(attr => [attr.attribute_code, attr])
    )

    return baseAggregations.map(baseAttr => {
        const filteredAttr = filteredMap.get(baseAttr.code)

        const filteredOptionsMap = new Map(
            (filteredAttr?.options || []).map(opt => [opt.value, opt])
        )

        return {
            code: baseAttr.code,
            label: baseAttr.label,
            options: baseAttr.options.map(baseOpt => {
                const filteredOpt = filteredOptionsMap.get(baseOpt.value)

                const filteredCount = filteredOpt?.count ?? 0

                return {
                    value: baseOpt.value,
                    label: baseOpt.label,
                    totalCount: baseOpt.filteredCount,
                    filteredCount,
                    isAvailable: filteredCount > 0
                }
            })
        }
    })
}