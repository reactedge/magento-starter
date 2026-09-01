import {analyseSearch} from "../../services/recommendations/analysesearch.service.ts";
import {useSystemState} from "../../state/System/useSystemState.ts";
import {useOptionSelectionFilter} from "./useOptionSelectionFilter.tsx";
import {useOptionLabelMap} from "./useOptionLabelMap.ts";
import {useIntentState} from "../../state/Intent/useIntentState.ts";
import {useActivityContext} from "../../activity/Context/useActivityContext.ts";
import type {AskAnalyseSearchResponse} from "../../types/domain/ai.analyse.search.ts"

export function useAnalyseSearch({
     attributeLayerData,
     categoryData,
     intentState
 }: AskAnalyseSearchResponse) {
    const activity = useActivityContext()
    const {graphqlClient, intentEngine} = useSystemState()
    const {dispatch} = useIntentState()

    const filter = useOptionSelectionFilter(categoryData)
    const optionLabelMap = useOptionLabelMap(attributeLayerData.attributes)

    const intentApiClient = intentEngine.getApiClient()

    const {attributeScore} = intentState

    const run = async () => {
        const result = await analyseSearch({
            graphqlClient,
            intentApiClient,
            filter,
            attributeScore,
            attributes: attributeLayerData.attributes ?? [],
            optionLabelMap,
            intentState
        })

        activity.log('recommendations', 'Recommendations Received', result.ai.suggestions);

        dispatch(
            result.ai?.suggestions?.length
                ? {type: "SUGGESTION_SUCCESS", recommendations: result.ai.suggestions, filters: intentState.attributeScore, intent: intentState.intentText}
                : {type: "SUGGESTION_EMPTY"}
        )
    }

    return run;
}

