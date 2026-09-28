import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import type { SsrDeploymentCheck } from "./StoreWorkspaceValidator.ts";

type JsonObject = Record<string, unknown>;

export class SsrArtifactValidator {
    constructor(private readonly repositoryRoot: string) {}

    validate(
        storeRoot: string,
        instance: string,
        required: boolean,
    ): SsrDeploymentCheck {
        const ssrRoot = join(storeRoot, "ssr", instance);

        if (!required) {
            return {
                required: false,
                valid: true,
                path: relative(this.repositoryRoot, ssrRoot),
                errors: [],
                artifacts: [],
            };
        }

        const errors: string[] = [];

        if (!existsSync(ssrRoot)) {
            errors.push("SSR directory is missing.");

            return {
                required: true,
                valid: false,
                path: relative(this.repositoryRoot, ssrRoot),
                errors,
                artifacts: [],
            };
        }

        const artifacts = readdirSync(ssrRoot)
            .filter(file => file.startsWith("output") && file.endsWith(".json"))
            .sort((a, b) => a.localeCompare(b));

        if (artifacts.length === 0) {
            errors.push("No SSR output artifacts were found.");
        }

        for (const artifact of artifacts) {
            const artifactPath = join(ssrRoot, artifact);
            const content = this.readArtifact(artifactPath, artifact, errors);

            if (!content) {
                continue;
            }

            if (typeof content.html !== "string") {
                errors.push(`${artifact}: SSR html is missing.`);
            }
        }

        return {
            required: true,
            valid: errors.length === 0,
            path: relative(this.repositoryRoot, ssrRoot),
            errors,
            artifacts,
        };
    }

    private readArtifact(
        artifactPath: string,
        artifact: string,
        errors: string[],
    ): JsonObject | null {
        try {
            const value: unknown = JSON.parse(
                readFileSync(artifactPath, "utf8"),
            );

            if (value === null || typeof value !== "object" || Array.isArray(value)) {
                errors.push(`${artifact}: Expected a JSON object.`);
                return null;
            }

            return value as JsonObject;
        } catch (error) {
            errors.push(
                `${artifact}: ${error instanceof Error ? error.message : "Unable to read JSON file."}`,
            );
            return null;
        }
    }
}
