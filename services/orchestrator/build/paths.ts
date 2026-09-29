/**
 * Centralizes filesystem path construction and directory conventions. Prevents path-building logic from spreading everywhere.
 */

import path from 'path';
import { getConfig } from "../deployment/config.ts";
import { ReactEdgeRoot } from "@reactedge/filesystem/reactedgeRoot.ts";

export class BuildPaths {
    constructor(
        private readonly repositoryRoot: string = ReactEdgeRoot.get(),
        private readonly storeCodeProvider: () => string = () => getConfig().storeCode
    ) {}

    getWidgetPath(widgetName: string): string {
        return path.join(
            this.repositoryRoot,
            'widgets',
            widgetName
        );
    }

    getWidgetAssetsPath(widgetName: string): string {
        return path.join(
            this.repositoryRoot,
            'workspace',
            'release',
            'source',
            widgetName
        );
    }

    getWidgetManifestsPath(widgetName: string): string {
        return path.join(
            this.repositoryRoot,
            'workspace',
            this.storeCodeProvider(),
            'manifests',
            widgetName
        );
    }

    getContractPath(
        widgetName: string,
        contractFile: string
    ): string {
        return path.join(
            this.repositoryRoot,
            'workspace',
            this.storeCodeProvider(),
            'contracts',
            widgetName,
            contractFile
        );
    }

    getSsrArtifactPath(artifactPath: string): string {
        return path.join(
            this.repositoryRoot,
            'workspace',
            this.storeCodeProvider(),
            'ssr',
            artifactPath
        );
    }

    getRegistryPath(): string {
        return path.join(
            this.repositoryRoot,
            'workspace',
            'registry.json'
        );
    }
}

const buildPaths = new BuildPaths();

export function getWidgetPath(widgetName: string): string {
    return buildPaths.getWidgetPath(widgetName);
}

export function getWidgetAssetsPath(widgetName: string): string {
    return buildPaths.getWidgetAssetsPath(widgetName);
}

export function getWidgetManifestsPath(widgetName: string): string {
    return buildPaths.getWidgetManifestsPath(widgetName);
}

export function getContractPath(
    widgetName: string,
    contractFile: string
): string {
    return buildPaths.getContractPath(widgetName, contractFile);
}

export function getSsrArtifactPath(artifactPath: string): string {
    return buildPaths.getSsrArtifactPath(artifactPath);
}

export function getRegistryPath(): string {
    return buildPaths.getRegistryPath();
}
