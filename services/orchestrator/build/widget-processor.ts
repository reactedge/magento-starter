/**
 * Coordinates all processing required for a single widget. Owns the "process one widget" workflow.
 */
import type { ProcessedWidget } from "./types.ts";
import { RegistryResolver } from "../deployment/RegistryResolver.ts";
import { WidgetBuilder } from "./widget-processor/build-widget.ts";
import { Report } from "../deployment/report.ts";
import { updateAssetRegistry } from "./widget-processor/asset-registry.ts";
import { loadContract } from "../contract/contract-loader.ts";
import { SsrLoader } from "./widget-processor/ssr-css-loader.ts";
import { writeManifest } from "./widget-processor/manifest-writer.ts";
import { getContractPath, getWidgetPath } from "./paths.ts";
import { ContractImageProcessor } from "../contract/optimiser/validate-images.ts";
import type { BuildWidgetRegistry } from "@reactedge/framework/contracts/buiild/BuildWidgetRegistry.ts";
import type { SsrViewMap } from "@reactedge/framework/contracts/buiild/WidgetSsrConfig.ts";
import { enqueueSsrGeneration } from "../ssr-worker/queue.ts"
import { getConfig } from "../deployment/config.ts";
import { resolveGenerationInputs } from "../ssr-worker/queue-input-resolver";
import {getFilename} from "./util";

type RegistryResult = ReturnType<typeof updateAssetRegistry>;
type ResolvedWidget = ReturnType<RegistryResolver["resolveWidgetEntry"]>;
type LoadedContract = Awaited<ReturnType<typeof loadContract>>;

const widgetBuilder = new WidgetBuilder();
const ssrLoader = new SsrLoader();

async function loadWidgetContract(
    widgetName: string,
    registryResult: RegistryResult,
    report: Report
): Promise<LoadedContract> {
    return loadContract(
        widgetName,
        registryResult.contract,
        report
    );
}

async function processContract(
    instanceName: string,
    contractResult: LoadedContract,
    resolved: ResolvedWidget,
    report: Report
): Promise<LoadedContract> {
    if (resolved?.imageOptimisation) {
        const imageProcessor = new ContractImageProcessor(instanceName);
        return imageProcessor.transform(
            contractResult,
            resolved.imageOptimisation,
            report
        );
    }

    return contractResult;
}

export class WidgetProcessor {
    private readonly registryResolver = new RegistryResolver();

    constructor(
        private readonly registry: BuildWidgetRegistry,
        private readonly report: Report
    ) {}

    async process(
        instanceName: string
    ): Promise<ProcessedWidget> {
        let manifestResult: string | null = null;
        let ssrViews: SsrViewMap = {};

        const resolved =
            this.registryResolver.resolveWidgetEntry(
                instanceName,
                this.registry
            );

        const widgetName =
            resolved.widget || instanceName;

        this.report.info(
            'Widget processing started',
            {
                widget: instanceName,
                buildTarget: widgetName
            }
        );

        try {
            const widgetPath = getWidgetPath(widgetName);
            widgetBuilder.build(widgetName, widgetPath, this.report);

            const registryResult = updateAssetRegistry(
                widgetName,
                instanceName,
                this.report
            );
            let contractResult = await loadWidgetContract(
                widgetName,
                registryResult,
                this.report
            );

            if (contractResult === null) {

                this.report.error(
                    'Contract not found'
                );

                return {
                    name: instanceName,
                    manifestFile: ''
                };
            }

            contractResult = await processContract(
                instanceName,
                contractResult,
                resolved,
                this.report
            );

            const contractFile = getFilename(registryResult.contract)

            const cssSsr = ssrLoader.load(widgetName, registryResult.cssFilename)

            const ssrStrategy =
                resolved?.ssr?.strategy ?? 'disabled';

            const CONFIG = getConfig()

            if (CONFIG.ssrEnabled && ssrStrategy !== 'disabled') {
                const variants =
                    resolved?.ssr?.variants ?? ['desktop'];

                for (const variant of variants) {

                    this.report.info(
                        `SSR variant ${variant} queued`,
                        {
                            widget: instanceName,
                            contract: contractResult,
                            strategy: ssrStrategy,
                        },
                    );

                    const localPath = getContractPath(widgetName, contractFile)
                    const generationInputs = await resolveGenerationInputs(
                        contractResult,
                        localPath
                    );

                    for (const input of generationInputs) {
                        const result = await enqueueSsrGeneration({
                            target: CONFIG.target,
                            widget: widgetName,
                            contract: input.contract,
                            bootstrap: input.bootstrap,
                            ...(input.key !== undefined && { key: input.key }),
                            variant,
                            outputFile: `${instanceName}/output${input.key !== undefined ? `-${input.key}` : ''}.json`,
                        });

                        this.report.info(
                            `SSR variant ${variant} generated`,
                            {
                                widget: instanceName,
                                artifactPath: result.artifactPath,
                            },
                        );
                    }
                }
            }

            const {
                entries: _entries,
                ...manifestContract
            } = contractResult;

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
                contract: manifestContract,
                contractFile
            };

            manifestResult = writeManifest(manifest, instanceName, this.report);

            this.report.info(
                'Widget Manifest',
                {
                    manifest
                }
            );

            this.report.success(
                'Widget processing completed',
                {
                    widget: instanceName
                }
            );
        }
        catch (error) {
            this.report.error(
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
}
