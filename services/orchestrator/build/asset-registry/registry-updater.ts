import path from "path";
import {readFileSync} from "fs";
import {getConfig} from "../../deployment/config.ts";
import type {Report} from "../../deployment/report.ts";
import {BuildPaths} from "../paths.ts";
import type {AssetRegistryResult} from "../types.ts";

export class AssetRegistryUpdater {
    constructor(
        private readonly report: Report,
        private readonly paths: BuildPaths = new BuildPaths(),
        private readonly configProvider = getConfig
    ) {}

    update(
        buildTarget: string,
        instanceName: string
    ): AssetRegistryResult {
        this.report.info(
            'Updating asset registry',
            {
                widget: instanceName,
                buildTarget
            }
        );

        const registryPath = this.paths.getRegistryPath();
        const widgetAssetsDir = this.paths.getWidgetAssetsPath(buildTarget);
        const config = this.configProvider();

        const manifestPath = path.join(
            widgetAssetsDir,
            `widget-${buildTarget}.manifest.json`
        );
        const manifest = JSON.parse(
            readFileSync(manifestPath, 'utf-8')
        );

        const { filename, hash, cssFilename } = manifest;

        if (!filename) {
            throw new Error('Missing filename in manifest');
        }

        const registry = JSON.parse(
            readFileSync(registryPath, 'utf-8')
        );

        if (!registry[instanceName]) {
            throw new Error(
                `Widget "${instanceName}" not found in registry`
            );
        }

        const entry = registry[instanceName];
        const newSrc = filename;

        if (config.ssrEnabled) {
            entry.src = 'index.ts';
        } else {
            entry.src = newSrc;
        }

        if (config.updateIntegrity && hash) {
            entry.integrity = hash;
        }

        const contract = `/${buildTarget}/contracts/${entry.contract}`;

        this.report.success(
            'Asset registry updated',
            {
                widget: instanceName,
                contract
            }
        );

        return {
            src: newSrc,
            hash,
            contract,
            cssFilename,
            integrity: entry.integrity
        };
    }
}
