/**
 * Coordinates all processing required for a single widget. Owns the "process one widget" workflow.
 */
import type { ProcessedWidget } from "./types.ts";
import { resolveWidgetEntry } from "./rebuild-registry/registry-loader.ts";
import { buildWidget } from "./widget-processor/build-widget.ts";
import { Report } from "./report.ts";
import { updateAssetRegistry } from "./widget-processor/asset-registry.ts";
import { loadContract } from "./widget-processor/contract-loader.ts";
import { loadSsrCss } from "./widget-processor/ssr-css-loader.ts";
import { writeManifest } from "./widget-processor/manifest-writer.ts";
import { getWidgetPath } from "./paths.ts";
import { ContractImageProcessor } from "./contract-loader/optimiser/validate-images.ts";
import type { BuildWidgetRegistry } from "@reactedge/framework/contracts/buiild/BuildWidgetRegistry.ts";
import type { SsrViewMap } from "@reactedge/framework/contracts/buiild/WidgetSsrConfig.ts";
import { enqueueSsrGeneration } from "../ssr-worker/queue.ts"
import { getConfig } from "../config.ts";

export async function processWidget(
    instanceName: string,
    registry: BuildWidgetRegistry,
    report: Report
): Promise<ProcessedWidget> {
    let manifestResult: string | null = null;
    let ssrViews: SsrViewMap = {};

    const resolved =
        resolveWidgetEntry(
            instanceName,
            registry
        );

    const widgetName =
        resolved.widget || instanceName;

    report.info(
        'Widget processing started',
        {
            widget: instanceName,
            buildTarget: widgetName
        }
    );

    try {
        const widgetPath = getWidgetPath(widgetName);
        buildWidget(widgetName, widgetPath, report);

        const registryResult = updateAssetRegistry(widgetName, instanceName, report);
        let contractResult = await loadContract(widgetName, registryResult.contract, report);

        if (contractResult === null) {

            report.error(
                'Contract not found'
            );

            return {
                name: instanceName,
                manifestFile: ''
            };
        }

        if (resolved?.imageOptimisation) {
            const imageProcessor = new ContractImageProcessor(instanceName);
            contractResult = await imageProcessor.transform(
                contractResult,
                resolved.imageOptimisation,
                report
            );
        }

        const contractFile = 'release.json'; //getFilename(registryResult.contract)

        const cssSsr = loadSsrCss(widgetName, registryResult.cssFilename)

        const ssrStrategy =
            resolved?.ssr?.strategy ?? 'disabled';

        if (ssrStrategy !== 'disabled') {
            const variants =
                resolved?.ssr?.variants ?? ['desktop'];

            for (const variant of variants) {

                report.info(
                    `SSR variant ${variant} queued`,
                    {
                        widget: instanceName,
                        contract: contractResult,
                        strategy: ssrStrategy,
                    },
                );

                const CONFIG = getConfig()

                const result = await enqueueSsrGeneration({
                    target: CONFIG.target,
                    widget: widgetName,
                    contract: contractResult,
                    variant,
                    outputFile: `${instanceName}/output.html`,
                });

                report.info(
                    `SSR variant ${variant} generated`,
                    {
                        widget: instanceName,
                        artifactPath: result.artifactPath,
                    },
                );
            }
        }

        const manifest = {
            id: instanceName,
            widget: widgetName,
            src: registryResult.src,
            css: registryResult.cssFilename,
            ssr: {
                css: cssSsr,
                strategy: resolved?.ssr?.strategy
            },
            integrity: registryResult.integrity,
            contract: contractResult,
            contractFile
        };

        manifestResult = writeManifest(manifest, instanceName, report);

        report.info(
            'Widget Manifest',
            {
                manifest
            }
        );

        report.success(
            'Widget processing completed',
            {
                widget: instanceName
            }
        );
    }
    catch (error) {
        report.error(
            'Widget processing failed',
            {
                widget: instanceName,
                error
            }
        );
    } finally {

    }

    return {
        name: instanceName,
        manifestFile: manifestResult
    };
}