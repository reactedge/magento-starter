export interface Config {
    targetSiteUrl: string
    storeCode: string
    allowedHosts: string[]
    hostEnvironment: "php" | "javascript"
}
