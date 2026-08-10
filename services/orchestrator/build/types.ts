export interface ProcessedWidget {
    name: string;
    manifestFile: string;
}

export type ContractData = Record<string, unknown>;

export interface ContractWrapper {
    _meta?: {
        site: string;
    };
    data: ContractData;
}

export interface AssetRegistryResult {
    src: string;
    cdn?: string;
    cssBundle?: string;
    cssFilename?: string;
    integrity: string
}

export interface ContractResult {
    contract: unknown | null;
    contractFile: string | null;
    localPath: string | null;
}

export interface Config {
    storeCode: string;
    targetSiteUrl: string,
    allowedHosts: string[],
    updateIntegrity: boolean,
    ssrEnabled: boolean;
}

export interface ValidationIssue {
    code: string;
    path: string;
    message: string;
}
