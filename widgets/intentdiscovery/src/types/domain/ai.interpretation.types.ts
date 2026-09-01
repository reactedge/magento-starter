import type {MagentoLayeredNavigation} from "./layered-data.types.ts";
import type {IntentControllerState} from "./intent.types.ts";
import type {IntentDiscoveryDataConfig} from "./intent-discovery.types.ts";

export type UseAskAiParams = {
    intent: IntentControllerState;
    attributeLayerData: MagentoLayeredNavigation,
    config: IntentDiscoveryDataConfig;
    setLoading: (loading: boolean) => void;
};

export type AiInterpretationRequest = {
    intent: {
        text: string
        signals: Record<string, Record<string, number>>
    }
    attributes: {
        code: string
        label: string
        options: {
            label: string
            value: string
            count: number
        }[]
    }[]
}

export type AttributeFilter = {
    "attribute": string,
    "value" : string,
    "label": string
}

export type AiInterpretationResponse = {
    filters: AttributeFilter[],
    correlation_id: string
}