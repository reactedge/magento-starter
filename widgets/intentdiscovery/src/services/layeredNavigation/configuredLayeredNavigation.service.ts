import {fetchBase} from "./fetchBase.ts";
import type {CategoryData} from "../../types/infra/magento/category.types.ts";
import {categoryLayereIds} from "../../lib/category.ts";
import type {MagentoLayeredNavigation} from "../../types/domain/layered-data.types.ts";
import type {GraphqlClient} from "@reactedge/framework/graphql/graphqlClient.ts";

export async function getConfiguredLayeredNavigation(
    categoryData: CategoryData,
    graphqlClient: GraphqlClient
): Promise<MagentoLayeredNavigation> {
    const categoryIds = categoryLayereIds(categoryData)

    const products = await fetchBase(categoryIds, graphqlClient)

    return {
        attributes: products?.aggregations ?? [],
        totalCount: products.total_count
    }
}
