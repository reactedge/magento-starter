import {buildAiInterpretationPayload} from "../../lib/ai-recommendations.ts";
import {sendRequestToAi} from "../../services/message-interpret.ts";
import {useOptionLabelMap} from "./useOptionLabelMap.ts";
import {useSystemState} from "../../state/System/useSystemState.ts";
import {useIntentState} from "../../state/Intent/useIntentState.ts";
import type { MergedAttribute} from "../../types/infra/magento/attribute.types.ts";
import {useActivityContext} from "../../activity/Context/useActivityContext.ts";
import type {UseAskAiParams} from "../../types/domain/ai.interpretation.types.ts"

export const useAskAi = ({
      intent,
      attributeLayerData,
      config,
      setLoading
  }: UseAskAiParams) => {
    const optionLabelMap = useOptionLabelMap(attributeLayerData.attributes);
    const { intentEngine} = useSystemState()
    const { intentState, setIntentText, setPreference, resetPreference} = useIntentState()
    const intentApiClient = intentEngine.getApiClient()
    const { dispatch } = useIntentState()
    const activity = useActivityContext()

    return async () => {
        const payload = buildAiInterpretationPayload(
            intentState,
            attributeLayerData.attributes as MergedAttribute[],
            intent.text,
            optionLabelMap,
            config
        )

        dispatch({ type: "INTERPRETATION_PROCESSING"});

        await sendRequestToAi({
            payload,
            intentApiClient,
            activity,
            setLoading,
            onSuccess: (json) => {
                //dispatch({ type: "INTERPRETATION_DONE", filters: json.filters, intent: payload.intent.text});
                dispatch({ type: "INTERPRETATION_DONE"});
                resetPreference()

                if (!json?.filters?.length && payload.intent.text!== "") {
                    dispatch({ type: "SUGGESTION_EMPTY"});
                    return
                }

                setIntentText(intent.text)

                for (const filter of json?.filters || []) {
                    if (!filter.attribute || !filter.value) {
                        continue
                    }

                    setPreference(filter.attribute, filter.value)
                }
            }
        })
    }
};