/**
 * Resolves and loads widget contracts from disk. Returns contract metadata and parsed content.
 */
import type {ContractResult, ContractWrapper} from "../types.ts";
import fs from "fs";
import {getContractPath} from "../paths.ts";
import {Report} from "../report.ts";
import {getFilename} from "../util.ts";
import {validateContract} from "../contract-loader/validator.ts";
import {wrapContract} from "../contract-loader/wrapper.ts";

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

        const issues = await validateContract(
            widgetName,
            contract,
            manifestContract
        );
        report.info(
            '✔ Loaded local contract',
            {
                contractFile: contractFile
            }
        );

        for (const issue of issues) {
            report.error(
                'Validation issue detected',
                {
                    code: issue.code,
                    path: issue.path,
                    message: issue.message
                }
            );
        }
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