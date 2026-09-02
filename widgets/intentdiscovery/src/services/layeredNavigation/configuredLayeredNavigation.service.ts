import { fetchBase } from "./fetchBase.ts";
import type { CategoryData } from "../../types/infra/magento/category.types.ts";
import { categoryLayereIds } from "../../lib/category.ts";
import type { MagentoLayeredNavigation } from "../../types/domain/layered-data.types.ts";
import type { GraphqlClient } from "@reactedge/framework/graphql/graphqlClient.ts";
import type { MagentoProducts } from "../../types/domain/layered-data.types.ts";
import type { MergedAttribute } from "../../types/infra/magento/attribute.types.ts"

export async function getConfiguredLayeredNavigation(
    categoryData: CategoryData,
    graphqlClient: GraphqlClient
): Promise<MagentoLayeredNavigation> {
    const categoryIds = categoryLayereIds(categoryData)

    const products = await fetchBase(categoryIds, graphqlClient)

    const base = convertLayerData(products)

    return {
        attributes: base ?? [],
        totalCount: products.total_count,
        baseTotalCount: 0
    }
}

export function convertLayerData(
    base: MagentoProducts
): MergedAttribute[] {
    const baseAggregations = base?.aggregations ?? []

    return baseAggregations.map(baseAttr => {
        return {
            code: baseAttr.attribute_code,
            label: baseAttr.label,
            options: baseAttr.options.map(baseOpt => {
                return {
                    value: baseOpt.value,
                    label: baseOpt.label,
                    totalCount: baseOpt.count,
                    isAvailable: false,
                    filteredCount: 0,
                    ...(baseOpt.swatch_data && {
                        visual: {
                            type:
                                baseOpt.swatch_data.type === "ColorSwatchData"
                                    ? "color"
                                    : "image",
                            value: baseOpt.swatch_data.value,
                        }
                    })
                }
            })
        }
    })
}