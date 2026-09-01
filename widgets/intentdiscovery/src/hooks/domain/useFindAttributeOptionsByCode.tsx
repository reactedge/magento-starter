import {enrichWithIntent} from "../../lib/option-match.ts";
import {useIntentState} from "../../state/Intent/useIntentState.ts";
import type {MagentoLayeredNavigation} from "../../types/domain/layered-data.types.ts";
import type { MergedAttribute} from "../../types/infra/magento/attribute.types.ts";
export const useFindAttributeOptionsByCode = (code: string, attributeLayerData: MagentoLayeredNavigation) => {
    const {intentState} = useIntentState()

    const result = attributeLayerData?.attributes?.filter((attribute: MergedAttribute) => attribute.code === code).map((attribute) => {
        const enrichedAttribute = enrichWithIntent(attribute, intentState)
        return enrichedAttribute
    })

    return {
        totalCount: attributeLayerData?.totalCount,
        attributeData: result && result?.length>0? result[0]: null
    };
}
