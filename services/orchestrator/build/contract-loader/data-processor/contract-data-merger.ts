import { ContractWrapper } from "../../types";
import path from "path";
import fs from "fs";

export function mergeContractData(
    contract: ContractWrapper,
    contractPath: string,
): ContractWrapper {
    const dataPath = path.join(
        path.dirname(contractPath),
        'data.json',
    );

    if (!fs.existsSync(dataPath)) {
        return contract;
    }

    const data = JSON.parse(
        fs.readFileSync(dataPath, 'utf-8'),
    );

    return {
        ...contract,
        ...data,
    };
}