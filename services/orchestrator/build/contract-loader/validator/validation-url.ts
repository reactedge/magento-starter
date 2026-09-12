import {getConfig} from "../../../config.ts";
import type {ValidationIssue} from "../../types.ts";
import {extractUrls} from "../data-extractor/url.ts";

export function validateUrls(
    contract: unknown,
    manifestContract: string
): ValidationIssue[] {

    const issues: ValidationIssue[] = [];

    const config =
        getConfig();

    const urls =
        extractUrls(contract);

    for (const url of urls) {

        const hostname =
            new URL(url).hostname;

        if (!isAllowedUrl(url, {
            allowedHosts: config.allowedHosts,
            targetSiteUrl: config.targetSiteUrl
        })) {
            issues.push({
                code: 'invalid_host',
                path: url,
                message:
                    `ContractFile ${manifestContract} contains disallowed host "${hostname}"`
            });
        }
    }

    return issues;
}

function isAllowedUrl(
    url: string,
    config: {
        allowedHosts: string[];
        targetSiteUrl: string;
    }
): boolean {
    const hostname = new URL(url).hostname;
    const targetHostname =
        new URL(config.targetSiteUrl).hostname;

    return (
        hostname === targetHostname ||
        config.allowedHosts.includes(hostname)
    );
}