import type {IntentDiscoveryDataConfig} from "../../domain/intent-discovery.types.ts";
import type {CategoryData} from "../../types/infra/magento/category.types.ts";
import {useIntentController} from "../../hooks/domain/useIntentController.tsx";
import {useIntentState} from "../../state/Intent/useIntentState.ts";
import {SearchSpinnerOverlay} from "../global/SearchSpinnerOverlay.tsx";
import {IntentMessage} from "./IntentDiscoveryLayout/IntentMessage.tsx";
import {AttributeLayer} from "./IntentDiscoveryLayout/AttributeLayer.tsx";
import {IntentDiscoveryOptions} from "./IntentDiscoveryLayout/IntentDiscoveryOptions.tsx";
import {ProductRecommendations} from "./IntentDiscoveryLayout/ProductRecommendations.tsx";
import {useLayeredNavigation} from "../../hooks/domain/useLayeredNavigation.tsx";
import {ErrorState} from "../global/ErrorState.tsx";
import {useActivityContext} from "../../activity/Context/useActivityContext.ts";

export interface Props {
    config: IntentDiscoveryDataConfig
    categoryData: CategoryData
}

export const IntentDiscoveryLayout = ({ config, categoryData}: Props) => {
    const activity = useActivityContext()
    const { intent } = useIntentController(config)
    const { intentState } = useIntentState()

    const {
        attributeLayerData,
        attributeLayerError
    } = useLayeredNavigation(categoryData, intentState, config)

    if (attributeLayerError) return <ErrorState error={attributeLayerError} />
    if (!attributeLayerData) return null

    activity.log('attribute-layer', 'Filtered Attribute Layer', attributeLayerData);

    const isProcessing =
        intentState.status === "suggestionProcessing" ||
        intentState.status === "readyToRecommend";

    return (
        <div className="intent-widget">
            {isProcessing && <SearchSpinnerOverlay />}
            <div className={intentState.status === "suggestionSent" ? "re-intent-layout re-intent-layout--two" : "re-intent-layout"}>
                <div className="re-intent-col re-intent-col--left">
                    <IntentMessage
                        intent={intent}
                        attributeLayerData={attributeLayerData}
                    />
                    <AttributeLayer
                        config={config}
                        intent={intent}
                        attributeLayerData={attributeLayerData}
                        categoryData={categoryData}
                    />
                    <IntentDiscoveryOptions
                        categoryData={categoryData}
                        attributeLayerData={attributeLayerData}
                    />
                </div>
                <div className="re-intent-col re-intent-col--right">
                    <ProductRecommendations />
                </div>
            </div>
        </div>
    );
};