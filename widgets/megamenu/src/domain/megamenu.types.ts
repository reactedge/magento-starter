
export interface RuntimeConfig {
    "platform": "wordpress" | "magento"
}

export interface MegaMenuDataConfig {
    readonly items: NavItem[];
}

export type MegaMenuSettingsConfig = {
    urlSuffix: string;
    dropdownLayouts?: {
        [urlPath: string]: "list" | "tiles";
    };
};

export type MenuType =
    | "none"
    | "simple-list"
    | "simple-tiles"
    | "complex";

export type MegaMenuProps = {
    items: NavItem[] | undefined;
    loading?: boolean;
    theme: MegaMenuSettingsConfig | undefined
};

export type NavItem = {
    id: string
    label: string
    url: string
    image: string | null
    children: NavItem[]
    meta?: {
        type?: "link" | "cta" | "banner" | undefined
        icon?: "arrow" | "external" | undefined
    }
}