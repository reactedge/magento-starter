import type {ReactEdgeRuntimeConfig} from "@reactedge/public-api/runtime.ts";


export function buildRuntimeConfig(): ReactEdgeRuntimeConfig | undefined {
    const configScript = document.getElementById('reactedge-runtime');

    if (!configScript) return;

    let config: ReactEdgeRuntimeConfig;

    try {
        config = JSON.parse(configScript.textContent || '');
    } catch {
        return;
    }

    return config;
}

export function stripMeta<T extends Record<string, unknown>>(
    contract: T
): T {
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _meta,
        ...cleanContract
    } = contract;

    return cleanContract as T;
}