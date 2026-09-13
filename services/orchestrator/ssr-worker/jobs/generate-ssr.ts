import type { SsrGenerationRequest, SsrGenerationResult } from "../job-types";
import { executeRenderer } from "./renderer.ts"
import { getSsrArtifactPath } from "../../build/paths.ts"
import { writeAtomicFile } from "../../build/util.ts"

type WriteSsrArtifactInput = {
    outputFile: string;
    html: string;
    bootstrap: unknown
};

export async function generateSsrArtifact(
    input: SsrGenerationRequest,
): Promise<SsrGenerationResult> {
    const html = await runSsrRenderer({
        widget: input.widget,
        contract: input.contract,
        bootstrap: input.bootstrap,
        runtimeConfig: null,
        variant: input.variant,
    });

    const artifactPath = await writeSsrArtifact({
        outputFile: input.outputFile,
        bootstrap: input.bootstrap,
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
        bootstrap: unknown;
        runtimeConfig: unknown;
        variant: string;
    },
): Promise<string> {
    return executeRenderer({
        widgetName: input.widget,
        contract: input.contract,
        bootstrap: input.bootstrap,
        variant: input.variant
    });
}

export async function writeSsrArtifact(
    input: WriteSsrArtifactInput,
): Promise<string> {
    const artifactPath = getSsrArtifactPath(
        input.outputFile,
    );

    const content = JSON.stringify({
        html: input.html,
        bootstrap: input.bootstrap
    })
    await writeAtomicFile(content, artifactPath)

    return artifactPath;
}