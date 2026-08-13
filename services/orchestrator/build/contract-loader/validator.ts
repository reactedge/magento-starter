import {validateUrls} from "./validator/validation-url.ts";
import {validateWidget} from "./validator/validate-schema.ts";
import type {ValidationIssue} from "../types.ts";

export async function validateContract(
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
