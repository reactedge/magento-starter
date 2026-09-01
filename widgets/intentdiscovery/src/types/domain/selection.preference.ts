import type {IntentEngineState} from "../../integration/intent/types.ts";

export type IntentLike = Pick<
    IntentEngineState,
    "attributeScore" | "categoryScore" | "priceAffinity"
>;