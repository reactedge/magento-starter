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
import { generateSsr } from "./widget-processor/ssr-generator.ts";
import { writeManifest } from "./widget-processor/manifest-writer.ts";
import { getWidgetPath } from "./paths.ts";
import { getFilename } from "./util.ts";
import { ContractImageProcessor } from "./contract-loader/optimiser/validate-images.ts";
import type {BuildWidgetRegistry} from "@reactedge/framework/contracts/buiild/BuildWidgetRegistry.ts";
import type {SsrViewMap} from "@reactedge/framework/contracts/buiild/WidgetSsrConfig.ts";

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
        let contractResult = await loadContract(widgetName, registryResult.cdn, report);

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

        const contractFile = getFilename(registryResult.cdn)

        const cssSsr = loadSsrCss(widgetName, registryResult.cssFilename)
        if (resolved?.ssr?.strategy === 'static') {
            const variants =
                resolved.ssr.variants ?? ['desktop'];

            for (const variant of variants) {
                report.info(
                    `SSR variant ${variant} started`,
                    {
                        widget: instanceName,
                        contractFile
                    }
                );
                ssrViews[variant] =
                    await generateSsr(
                        widgetName,
                        contractFile,
                        variant,
                        report
                    );
            }
        }

        const manifest = {
            id: instanceName,
            widget: widgetName,
            src: registryResult.src,
            css: registryResult.cssBundle,
            ssr: {
                views: ssrViews,
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