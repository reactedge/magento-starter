import type { MergedAttribute } from "../infra/magento/attribute.types.ts";

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


export interface MagentoAggregationOption {
    count: number;
    label: string;
    value: string;
    swatch_data?: {
        value: string // "#000000" OR image URL depending on type
        type: "ColorSwatchData" | "ImageSwatchData"
    } | null
}

export interface MagentoAggregation {
    attribute_code: string;
    label: string;
    count: number;
    options: MagentoAggregationOption[];
}

export interface MagentoProducts {
    total_count: number;
    aggregations: MagentoAggregation[];
};

export type ProductAttributesResponse = {
    products: MagentoProducts;
}

