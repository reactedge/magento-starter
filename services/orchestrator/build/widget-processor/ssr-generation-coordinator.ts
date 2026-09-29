import { BuildPaths } from "../paths.ts";
import type { Report } from "../../deployment/report.ts";
import { getConfig } from "../../deployment/config.ts";
import { enqueueSsrGeneration } from "../../ssr-worker/queue.ts";
import { resolveGenerationInputs } from "../../ssr-worker/queue-input-resolver.ts";

export interface SsrGenerationInput {
    instanceName: string;
    widgetName: string;
    contractFile: string;
    contract: unknown;
    strategy: string;
    variants?: readonly string[];
}

export class SsrGenerationCoordinator {
    constructor(
        private readonly report: Report,
        private readonly paths: BuildPaths = new BuildPaths(),
        private readonly configProvider = getConfig
    ) {}

    async generate({
        instanceName,
        widgetName,
        contractFile,
        contract,
        strategy,
        variants = ['desktop']
    }: SsrGenerationInput): Promise<void> {
        const config = this.configProvider();

        if (!config.ssrEnabled || strategy === 'disabled') {
            return;
        }

        const localPath = this.paths.getContractPath(
            widgetName,
            contractFile
        );

        for (const variant of variants) {
            this.report.info(
                `SSR variant ${variant} queued`,
                {
                    widget: instanceName,
                    contract,
                    strategy
                }
            );

            const generationInputs = resolveGenerationInputs(
                contract as Parameters<typeof resolveGenerationInputs>[0],
                localPath
            );

            for (const input of generationInputs) {
                const result = await enqueueSsrGeneration({
                    target: config.target,
                    widget: widgetName,
                    contract: input.contract,
                    bootstrap: input.bootstrap,
                    ...(input.key !== undefined && { key: input.key }),
                    variant,
                    outputFile: `${instanceName}/output${input.key !== undefined ? `-${input.key}` : ''}.json`
                });

                this.report.info(
                    `SSR variant ${variant} generated`,
                    {
                        widget: instanceName,
                        artifactPath: result.artifactPath
                    }
                );
            }
        }
    }
}
