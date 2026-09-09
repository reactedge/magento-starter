import type { SsrGenerationRequest, SsrGenerationResult } from "../job-types";
import { executeRenderer } from "./renderer.ts"
import { getSsrArtifactPath } from "../../build/paths.ts"
import { writeAtomicFile } from "../../build/util.ts"

type WriteSsrArtifactInput = {
    outputFile: string;
    html: string;
};

export async function generateSsrArtifact(
    input: SsrGenerationRequest,
): Promise<SsrGenerationResult> {
    const html = await runSsrRenderer({
        widget: input.widget,
        contract: input.contract,
        runtimeConfig: null,
        variant: input.variant,
    });

    const artifactPath = await writeSsrArtifact({
        outputFile: input.outputFile,
        html,
    });

    return {
        artifactPath,
    };
}

export async function runSsrRenderer(
    input: {
        widget: string;
        contract: unknown;
        runtimeConfig: unknown;
        variant: string;
    },
): Promise<string> {
    return executeRenderer({
        widgetName: input.widget,
        contract: input.contract,
        variant: input.variant
    });
}

export async function writeSsrArtifact(
    input: WriteSsrArtifactInput,
): Promise<string> {
    const artifactPath = getSsrArtifactPath(
        input.outputFile,
    );

    await writeAtomicFile(input.html, artifactPath)

    return artifactPath;
}