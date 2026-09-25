import 'dotenv/config';
import dotenv from 'dotenv';
import type {Config} from "./types/config.ts";
import path from "path";

let CONFIG: Config;

export function loadConfig(
    storeCode: string
): void {
    const envFile = path.resolve(
        import.meta.dirname,
        `.env.${storeCode}`
    );

    const result = dotenv.config({
        path: envFile,
        override: true
    });

    if (result.error) {
        throw new Error(
            `Unable to load MCP environment "${storeCode}": ${envFile}`
        );
    }

    CONFIG = {
        storeCode: process.env.STORE_CODE!,
        targetSiteUrl: process.env.SITEURL!,
        allowedHosts: (process.env.ALLOWED_HOSTS ?? "")
            .split(",")
            .map(host => host.trim())
            .filter(Boolean),
        hostEnvironment:
            process.env.PHP_ENV === "0"
                ? "javascript"
                : "php",
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
