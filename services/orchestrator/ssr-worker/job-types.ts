import type { ContractResult } from "../build/types";

export const SSR_GENERATION_QUEUE = "ssr-generation";
export const GENERATE_SSR_JOB = "generate-ssr";

export type SsrGenerationRequest = {
    target: string; // this is to propagate the config inside the worker process
    widget: string;
    contract: unknown;
    variant: string;
    key?: string;

    /**
     * Relative to SSR_OUTPUT_ROOT.
     * For example: "usp/output.html".
     */
    outputFile: string;
};

export type SsrGenerationResult = {
    artifactPath: string;
};

export interface GenerationDataEntry {
    key: string;
    dataFile: string;
}

export interface GenerationData {
    entries?: GenerationDataEntry[];
}

export interface GenerationInput {
    key?: string;
    contract: ContractResult;
    data?: unknown;
}