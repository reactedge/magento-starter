import fs from 'node:fs';
import path from 'node:path';
import { type ContractResult } from "../build/types";
import type { GenerationData, GenerationInput } from "./job-types";

export function resolveGenerationInputs(
    contract: ContractResult,
    contractPath: string,
): GenerationInput[] {
    const dataPath = path.join(
        path.dirname(contractPath),
        'data.json',
    );

    if (!fs.existsSync(dataPath)) {
        return [{
            contract
        }];
    }

    const generationData: GenerationData = JSON.parse(
        fs.readFileSync(dataPath, 'utf-8'),
    );

    if (!generationData.entries?.length) {
        return [{
            contract,
            bootstrap: generationData
        }];
    }

    return generationData.entries.map((entry) => {
        const entryPath = path.resolve(
            path.dirname(dataPath),
            entry.dataFile,
        );

        if (!fs.existsSync(entryPath)) {
            throw new Error(
                `Generation data file not found: ${entryPath}`,
            );
        }

        const data = JSON.parse(
            fs.readFileSync(entryPath, 'utf-8'),
        );

        return {
            contract: contract,
            bootstrap: data,
            key: entry.key
        }
    });
}