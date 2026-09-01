import type {MergedAttribute} from "../infra/magento/attribute.types.ts";

export type MagentoLayeredNavigation = {
    attributes: MergedAttribute[] | null
    totalCount: number
    baseTotalCount: number
}

export type LayeredNavigationResult = {
    attributeLayerData: MagentoLayeredNavigation | null
    attributeLayerLoading: boolean
    attributeLayerError: Error | null
    refetch: () => Promise<void>
}