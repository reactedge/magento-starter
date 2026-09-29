/**
 * Resolves and loads widget contracts from disk. Returns parsed contract content and exposes contract validation through the same boundary.
 */
import type { ContractWrapper, ValidationIssue } from "../build/types.ts";
import fs from "fs";
import { BuildPaths } from "../build/paths.ts";
import type { Report } from "../deployment/report.ts";
import { getFilename } from "../build/util.ts";
import { wrapContract } from "./wrapper.ts";
import { ContractValidator } from "./validator.ts";

export class ContractLoader {
    constructor(
        private readonly report: Report,
        private readonly paths: BuildPaths = new BuildPaths(),
        private readonly validator: ContractValidator = new ContractValidator()
    ) {}

    async load(
        widgetName: string,
        manifestContract: string
    ): Promise<ContractWrapper | null> {
        let contract: ContractWrapper | null = null;

        const contractFile = getFilename(manifestContract);
        const localPath = this.paths.getContractPath(
            widgetName,
            contractFile
        );

        if (fs.existsSync(localPath)) {
            const content = fs.readFileSync(localPath, 'utf-8');
            contract = JSON.parse(content) as ContractWrapper;
            contract = wrapContract(contract);
        }

        if (!contract) {
            this.report.info(
                'SSR skipped',
                {
                    widget: widgetName,
                    reason: 'missing-contract'
                }
            );

            return null;
        }

        return contract;
    }

    validate(
        widgetName: string,
        contract: unknown,
        manifestContract: string
    ): Promise<ValidationIssue[]> {
        return this.validator.validate(
            widgetName,
            contract,
            manifestContract
        );
    }
}
