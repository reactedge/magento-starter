import type {EnrichedSuggestion} from "../infra/magento/product.types.ts";

export interface AiRecommendationRequest {
    intent: {
        signals: Record<string, Record<string, number>>
    }
    products: {
        sku: string
        title: string
        shortDescription?: string
        attributes: Record<string, string[]>
    }[]
}

export interface AiRecommendationResponse {
    suggestions: EnrichedSuggestion[] | null
}
