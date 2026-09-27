import {
    readFileSync,
    readdirSync,
} from "node:fs";
import {join, relative} from "node:path";
import type {WorkspaceValidationIssue} from "./WorkspaceValidation";

export class WorkspaceUrlValidator {
    validate(
        storeRoot: string,
        targetSiteUrl: string,
    ): WorkspaceValidationIssue[] {
        const issues: WorkspaceValidationIssue[] = [];
        const targetHost = new URL(targetSiteUrl).hostname;

        const walkValue = (
            value: unknown,
            file: string,
            path: string,
        ): void => {
            if (typeof value === "string") {
                if (!value.startsWith("http://") &&
                    !value.startsWith("https://")) {
                    return;
                }

                try {
                    const url = new URL(value);

                    if (url.hostname !== targetHost) {
                        issues.push({
                            type: "invalid-url",
                            file: relative(storeRoot, file),
                            path,
                            actual: value,
                            expected: targetSiteUrl,
                            message:
                                `URL points to ${url.hostname} instead of ${targetHost}`,
                            suggestedFix:
                                `Replace ${url.origin} with ${new URL(targetSiteUrl).origin}`,
                        });
                    }
                } catch {
                    // Not a valid URL.
                }

                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    walkValue(
                        item,
                        file,
                        `${path}[${index}]`,
                    );
                });

                return;
            }

            if (value !== null && typeof value === "object") {
                for (const [key, child] of Object.entries(value)) {
                    walkValue(
                        child,
                        file,
                        path ? `${path}.${key}` : key,
                    );
                }
            }
        };

        const walkDirectory = (directory: string): void => {
            for (const entry of readdirSync(directory, {
                withFileTypes: true,
            })) {
                const entryPath = join(directory, entry.name);

                if (entry.isDirectory()) {
                    walkDirectory(entryPath);
                    continue;
                }

                if (!entry.isFile() || !entry.name.endsWith(".json")) {
                    continue;
                }

                try {
                    const content = JSON.parse(
                        readFileSync(entryPath, "utf8"),
                    );

                    walkValue(content, entryPath, "");
                } catch {
                    // JSON validity is owned by the validator responsible for that file.
                }
            }
        };

        walkDirectory(storeRoot);

        return issues;
    }
}
