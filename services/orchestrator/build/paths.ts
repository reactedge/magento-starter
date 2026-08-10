/**
 * Centralizes filesystem path construction and directory conventions. Prevents path-building logic from spreading everywhere.
 */

import path from 'path';
import {getConfig} from "../config.ts";
import {ReactEdgeRoot} from "@reactedge/filesystem/reactedgeRoot.ts";

export function getWidgetPath(
    widgetName: string
): string {
    return path.join(
        ReactEdgeRoot.get(),
        'widgets',
        widgetName
    );
}

export function getWidgetAssetsPath(
    widgetName: string
): string {
    return path.join(
        ReactEdgeRoot.get(),
        'workspace',
        'release',
        'source',
        widgetName
    );
}

export function getWidgetManifestsPath(
    widgetName: string
): string {
    const CONFIG = getConfig()
    return path.join(
        ReactEdgeRoot.get(),
        'workspace',
        CONFIG.storeCode,
        'manifests',
        widgetName
    );
}

export function getContractPath(
    widgetName: string,
    contractFile: string
): string {
    const CONFIG = getConfig()
    return path.join(
        ReactEdgeRoot.get(),
        'workspace',
        CONFIG.storeCode,
        'contracts',
        widgetName,
        contractFile
    );
}

export function getRegistryPath(): string {
    return path.join(
        ReactEdgeRoot.get(),
        'workspace',
        'registry.json'
    );
}