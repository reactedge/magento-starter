import {validateUrls} from "./validator/validation-url.ts";
import {validateWidget} from "./validator/validate-schema.ts";
import type {ValidationIssue} from "../build/types.ts";

export class ContractValidator {
    async validate(
        widgetName: string,
        contract: unknown,
        manifestContract: string
    ): Promise<ValidationIssue[]> {
        const urlIssues =
            validateUrls(
                contract,
                manifestContract
            );

        const widgetIssues =
            await validateWidget(
                widgetName,
                contract
            );

        return [
            ...urlIssues,
            ...widgetIssues
        ];
    }
}

const contractValidator = new ContractValidator();

export async function validateContract(
    widgetName: string,
    contract: unknown,
    manifestContract: string
): Promise<ValidationIssue[]> {
    return contractValidator.validate(
        widgetName,
        contract,
        manifestContract
    );
}
