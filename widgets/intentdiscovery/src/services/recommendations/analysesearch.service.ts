
import {fetchRecommendations} from "./fetchRecommendations.ts";
import type {AttributeFilters, IntentEngineState} from "../../integration/intent/types.ts";
import {findProducts} from "./fetchProducts.ts";
import type {MagentoProductFilter} from "../../types/domain/selection.filter.ts";
import type { MergedAttribute} from "../../types/infra/magento/attribute.types.ts";
import type {OptionLabelMap} from "../../types/domain/option.map.ts";
import type {IntentApiClient} from "../../integration/intent/intentApiClient.ts";
import type {GraphqlClient} from "@reactedge/framework/graphql/graphqlClient.ts";

export type AnalyseSearchParams = {
    intentApiClient: IntentApiClient
    graphqlClient: GraphqlClient
    filter: MagentoProductFilter
    attributeScore: AttributeFilters
    attributes: MergedAttribute[]
    optionLabelMap: OptionLabelMap
    intentState: IntentEngineState
}

export async function analyseSearch(params: AnalyseSearchParams) {
    const products = await findProducts(params)

    const ai = await fetchRecommendations({
        ...params,
        products
    })

    return { products, ai }
}