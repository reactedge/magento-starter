export interface GalleryTile {
    src: string;
    srcset?: string;
    sizes?: string;
    alt?: string;
}

export type GallerySettings =
    | {
    readonly mode: "gallery";
}
    | {
    readonly mode: "tile";
    readonly maxColumns: number;
};

export interface WidgetConfig {
    readonly tiles:  GalleryTile[];
    readonly settings: GallerySettings;
    readonly runtime: RuntimeConfig
    readonly integrations: ResolvedConfigIntegrations
}

export interface RuntimeConfig {
    storeCode: string;
    sku: string;
}

export interface ReactEdgeRuntimeConfig {
    readonly integrations: ReactEdgeRuntimeIntegrations;
    readonly context: RuntimeConfig
}

export interface ReactEdgeRuntimeIntegrations {
    readonly magentoGraphql: {
        readonly api: string
    };
}

export interface ResolvedConfigIntegrations {
    readonly magentoGraphql: {
        readonly api: string
    };
}