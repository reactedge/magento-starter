import type {MagentoLayeredNavigation} from "./layered-data.types.ts";
import type {CategoryData} from "../infra/magento/category.types.ts";
import type {IntentEngineState} from "../../integration/intent/types.ts";
import type {EnrichedSuggestion} from "../infra/magento/product.types.ts";
import type {AiRecommendationResponse} from "./ai.recommendations.types.ts";

export type AskAnalyseSearchResponse = {
    attributeLayerData: MagentoLayeredNavigation
    categoryData: CategoryData,
    intentState: IntentEngineState
};

export type AnalyseSearchResult = {
    aiRecommendation: EnrichedSuggestion[] | null,
    searchLoading: boolean,
    error: Error | null
}

export type SearchDataState = {
    data: AiRecommendationResponse | null,
    loading: boolean,
    error: Error | null
}