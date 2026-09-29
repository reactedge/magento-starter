/**
 * Updates registry entries after a widget build. Owns asset registry update orchestration and reporting.
 */

import type {Report} from "../../deployment/report.ts";
import {AssetRegistryUpdater} from "../asset-registry/registry-updater.ts";
import {BuildPaths} from "../paths.ts";
import type {AssetRegistryResult} from "../types.ts";

const buildPaths = new BuildPaths();
const assetRegistryUpdater = new AssetRegistryUpdater();

export function updateAssetRegistry(
    widgetName: string,
    name: string,
    report: Report
): AssetRegistryResult {
    report.info(
        'Updating asset registry',
        {
            widget: name,
            buildTarget: widgetName
        }
    );

    const result = assetRegistryUpdater.update({
        widgetName: name,
        buildTarget: widgetName,
        registryPath: buildPaths.getRegistryPath(),
        widgetAssetsDir: buildPaths.getWidgetAssetsPath(widgetName)
    });

    report.success(
        'Asset registry updated',
        {
            widget: name,
            contract: result.contract
        }
    );

    return result;
}
