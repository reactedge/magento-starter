import 'dotenv/config';
import dotenv from 'dotenv';
import type {Config} from "./types/config.ts";

let CONFIG: Config;

export function loadConfig(
    envFile: string
): void {

    dotenv.config({
        path: envFile,
        override: true
    });

    CONFIG = {
        targetSiteUrl: process.env.SITEURL!
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
