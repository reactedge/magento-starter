import { mapIntentToDisplay } from "./mapIntentToDisplay.ts";
import type { MergedAttribute } from "../../../../../types/infra/magento/attribute.types.ts";
import type { PersistedIntentV1 } from "../../../../../services/intentPersistence/intentPersistence.service.ts";
import type { OptionLabelMap } from "../../../../../types/domain/option.map.ts";

export function resolvePersistedIntentFilters(
    attributes: MergedAttribute[],
    intent: PersistedIntentV1,
    optionLabelMap: OptionLabelMap
) {

    const attributeMap = Object.fromEntries(
        attributes.map(a => [a.code, a])
    );

    const attributesDisplay = mapIntentToDisplay(
        intent?.attributeScore,
        attributeMap,
        optionLabelMap
    );

    return attributesDisplay;
}


