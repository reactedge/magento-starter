import { useMemo } from "react"
import { applyIntentConfig } from "../../lib/attributes"
import type { IntentDiscoveryDataConfig } from "../../types/domain/intent-discovery.types"
import { useIntentState } from "../../state/Intent/useIntentState.ts";
import type { MergedAttribute } from "../../types/infra/magento/attribute.types.ts";
export function useFindIntentProducts() {
    const { intentState } = useIntentState()
    const intentAttributes = Object.keys(intentState.attributeScore)

    return intentAttributes.join("\n")
}
export function useIntentAttributes(
    attributeData: MergedAttribute[],
    config: IntentDiscoveryDataConfig
) {
    return useMemo(
        () => applyIntentConfig(attributeData, config),
        [attributeData, config]
    )
}