export const SSR_GENERATION_QUEUE = "ssr-generation";
export const GENERATE_SSR_JOB = "generate-ssr";

export type SsrGenerationRequest = {
    target: string; // this is to propagate the config inside the worker process
    widget: string;
    contract: unknown;
    variant: string;

    /**
     * Relative to SSR_OUTPUT_ROOT.
     * For example: "usp/output.html".
     */
    outputFile: string;
};

export type SsrGenerationResult = {
    artifactPath: string;
};