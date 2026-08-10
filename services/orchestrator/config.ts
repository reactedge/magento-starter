import 'dotenv/config';
import dotenv from 'dotenv';
import type {Config} from "./build/types.ts";

let CONFIG: Config;

export function loadConfig(
    envFile: string
): void {

    dotenv.config({
        path: envFile,
        override: true
    });

    CONFIG = {
        storeCode: process.env.STORE_CODE!,
        targetSiteUrl: process.env.SITEURL!,
        allowedHosts: (process.env.ALLOWED_HOSTS ?? '')
            .split(',')
            .map(host => host.trim())
            .filter(Boolean),
        updateIntegrity: process.env.UPDATE_INTEGRITY
            ? process.env.UPDATE_INTEGRITY === 'true'
            : false,
        ssrEnabled: process.env.SSR_ENABLED
            ? process.env.SSR_ENABLED === '1'
            : false
    };
}

export function getConfig(): Config {

    if (!CONFIG) {
        throw new Error(
            'Configuration has not been initialised'
        );
    }

    return CONFIG;
}
