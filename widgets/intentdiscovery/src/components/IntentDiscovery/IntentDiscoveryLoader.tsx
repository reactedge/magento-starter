import { ErrorState } from "../global/ErrorState.tsx";
import type { IntentDiscoveryDataConfig } from "../../types/domain/intent-discovery.types.ts";
import type { CategoryData } from "../../types/infra/magento/category.types.ts";
import { IntentDiscoveryLayout } from "./IntentDiscoveryLayout.tsx";
import { InteractionStateProvider } from "../../state/Interaction/InteractionStateProvider.tsx";
import { IntentStateProvider } from "../../state/Intent/IntentStateProvider.tsx";
import { useActivityContext } from "../../activity/Context/useActivityContext.ts";
import { useConfiguredLayeredNavigation } from "../../hooks/domain/useConfiguredLayeredAttributes.tsx";

type LoaderProps = {
    config: IntentDiscoveryDataConfig
    categoryData: CategoryData
}

export const IntentDiscoveryLoader = ({ config, categoryData }: LoaderProps) => {
    const activity = useActivityContext()

    const {
        attributeLayerData,
        attributeLayerError
    } = useConfiguredLayeredNavigation(categoryData)

    if (attributeLayerError) return <ErrorState error={attributeLayerError} />
    if (!attributeLayerData) return null

    activity.log('attribute-layer', 'Configured Attribute Layer', attributeLayerData);

    return (
        <IntentStateProvider config={config} configuredLayeredAttributes={attributeLayerData} activity={activity}>
            <InteractionStateProvider>
                <IntentDiscoveryLayout
                    config={config}
                    categoryData={categoryData}
                />
            </InteractionStateProvider>
        </IntentStateProvider>
    )
}