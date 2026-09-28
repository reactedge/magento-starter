/**
 * Resolves and loads widget contracts from disk. Returns contract metadata and parsed content.
 */
import type { ContractResult, ContractWrapper } from "../build/types.ts";
import fs from "fs";
import { getContractPath } from "../build/paths.ts";
import { Report } from "../deployment/report.ts";
import { getFilename } from "../build/util.ts";
import { validateContract } from "./validator.ts";
import { wrapContract } from "./wrapper.ts";

export async function loadContract(
    widgetName: string,
    manifestContract: string,
    report: Report
): Promise<ContractResult> {
    let contract = null;

    const contractFile = getFilename(manifestContract)
    const localPath = getContractPath(widgetName, contractFile)

    if (fs.existsSync(localPath)) {
        const content = fs.readFileSync(localPath, 'utf-8');
        contract = JSON.parse(content) as ContractWrapper
        contract = wrapContract(contract)
    }

    if (!contract) {
        report.info(
            'SSR skipped',
            {
                widget: widgetName,
                reason: 'missing-contract'
            }
        );

        return null;
    }

    return contract
}