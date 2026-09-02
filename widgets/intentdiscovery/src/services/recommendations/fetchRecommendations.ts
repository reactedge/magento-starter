import type { MergedAttribute } from "../../types/infra/magento/attribute.types.ts";
import type { AiRecommendationResponse } from "../../types/domain/ai.recommendations.types.ts"
import type { AttributeFilters } from "../../integration/intent/types.ts";
import type { GraphqlProduct } from "../../types/infra/magento/product.types.ts";
import type { IntentApiClient } from "../../integration/intent/intentApiClient.ts";
import { enrichSuggestions } from "../mappers/suggestions/enrichSuggestions.ts";
import { buildAiRecommendationPayload } from "../../lib/ai-recommendations.ts";
import type { OptionLabelMap } from "../../types/domain/option.map.ts";

export async function fetchRecommendations({
    attributeScore,
    attributes,
    products,
    optionLabelMap,
    intentApiClient
}: {
    attributeScore: AttributeFilters
    attributes: MergedAttribute[]
    products: GraphqlProduct[]
    optionLabelMap: OptionLabelMap
    intentApiClient: IntentApiClient
}): Promise<AiRecommendationResponse> {

    if (
        !attributeScore ||
        Object.keys(attributeScore).length === 0 ||
        !attributes?.length ||
        !products?.length
    ) {
        return { suggestions: [] }
    }

    const payload = buildAiRecommendationPayload(
        attributeScore,
        products,
        optionLabelMap
    )

    const json = await intentApiClient.suggest(payload)

    const enriched = enrichSuggestions(
        json.suggestions ?? [],
        products,
        optionLabelMap
    )

    return { suggestions: enriched }
}