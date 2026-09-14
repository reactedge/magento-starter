import {
    readFileSync,
    readdirSync,
    existsSync
} from "node:fs";
import {join, relative, resolve} from "node:path";

export interface InvalidWorkspaceUrl {
    file: string;
    path: string;
    url: string;
}

export interface StoreWorkspaceValidationResult {
    store: string;
    valid: boolean;
    error?: string;
    invalidUrls: InvalidWorkspaceUrl[];
    invalidHost?: string;
    expectedHost?: string;
    suggestedFix?: string;
}

export class StoreWorkspaceValidator {
    private readonly repositoryRoot: string;

    constructor(repositoryRoot: string) {
        this.repositoryRoot = repositoryRoot;
    }

    validate(store: string, targetSiteUrl: string): StoreWorkspaceValidationResult {
        const storeRoot = resolve(
            this.repositoryRoot,
            "workspace",
            store,
        );

        if (!existsSync(storeRoot)) {
            return {
                store,
                valid: false,
                error: `Unknown store: ${store}`,
                invalidUrls: [],
            };
        }

        const invalidUrls =
            this.validateUrls(storeRoot, targetSiteUrl);

        if (invalidUrls.length === 0) {
            return {
                store,
                valid: true,
                invalidUrls: [],
            };
        }

        const invalidHost =
            new URL(invalidUrls[0].url).origin;

        const expectedHost =
            new URL(targetSiteUrl).origin;

        return {
            store,
            valid: false,
            invalidUrls,
            invalidHost,
            expectedHost,
            suggestedFix: `find workspace/${store} -type f -exec sed -i 's|${invalidHost}|${expectedHost}|g' {} +`,
        };
    }

    private validateUrls(
        storeRoot: string,
        targetSiteUrl: string,
    ): InvalidWorkspaceUrl[] {
        const invalidUrls: InvalidWorkspaceUrl[] = [];
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
                        invalidUrls.push({
                            file: relative(storeRoot, file),
                            path,
                            url: value,
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

                const content = JSON.parse(
                    readFileSync(entryPath, "utf8"),
                );

                walkValue(content, entryPath, "");
            }
        };

        walkDirectory(storeRoot);

        return invalidUrls;
    }
}

