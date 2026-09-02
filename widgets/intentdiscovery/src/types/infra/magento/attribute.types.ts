export interface MagentoAttribute {
    code: string
    frontend_input: string
    label: string
}

export interface MagentoAttributeOption {
    attribute: string
    value: number
}

export type MergedAttribute = {
    code: string
    label: string
    options: MergedAttributeOption[]
}

export type MergedAttributeOption = {
    value: string
    label: string
    totalCount: number
    filteredCount: number
    isAvailable: boolean
    visual?: {
        type: "color" | "image"
        value: string
    }
}

export type AttributeResponse = {
    attributesList: {
        items: MagentoAttribute[]
    }
}


