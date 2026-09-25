import {
    existsSync,
    readdirSync,
} from "node:fs";
import {relative, resolve} from "node:path";
import type {
    RegistryWidgetEntry,
    WorkspaceHostEnvironment,
    WorkspaceValidationIssue,
} from "./WorkspaceValidation";

export class ReleaseArtifactValidator {
    constructor(
        private readonly repositoryRoot: string,
    ) {}

    validate(
        entry: RegistryWidgetEntry,
        environment: WorkspaceHostEnvironment,
    ): WorkspaceValidationIssue[] {
        const releaseDirectory = resolve(
            this.repositoryRoot,
            "workspace",
            "release",
            "source",
            entry.widget,
        );

        if (!existsSync(releaseDirectory)) {
            return [{
                type: "missing-release-directory",
                widget: entry.widget,
                instance: entry.instance,
                file: relative(this.repositoryRoot, releaseDirectory),
                message:
                    `Release directory does not exist for widget "${entry.widget}".`,
            }];
        }

        const issues: WorkspaceValidationIssue[] = [];
        const files = readdirSync(releaseDirectory);

        if (environment === "php") {
            const bundlePattern = new RegExp(
                `^widget-${this.escapeRegExp(entry.widget)}@.+\\.iife\\.js$`,
            );

            if (!files.some(file => bundlePattern.test(file))) {
                issues.push({
                    type: "missing-bundle",
                    widget: entry.widget,
                    instance: entry.instance,
                    file: relative(this.repositoryRoot, releaseDirectory),
                    expected: `widget-${entry.widget}@<hash>.iife.js`,
                    message:
                        `PHP release for widget "${entry.widget}" does not contain its IIFE bundle.`,
                });
            }
        } else {
            const indexPath = resolve(releaseDirectory, "index.js");

            if (!existsSync(indexPath)) {
                issues.push({
                    type: "missing-index",
                    widget: entry.widget,
                    instance: entry.instance,
                    file: relative(this.repositoryRoot, indexPath),
                    expected: "index.js",
                    message:
                        `JavaScript release for widget "${entry.widget}" does not contain index.js.`,
                });
            }
        }

        const cssFile = `widget-${entry.widget}.css`;
        const cssPath = resolve(releaseDirectory, cssFile);

        if (!existsSync(cssPath)) {
            issues.push({
                type: "missing-css",
                widget: entry.widget,
                instance: entry.instance,
                file: relative(this.repositoryRoot, cssPath),
                expected: cssFile,
                message:
                    `Release for widget "${entry.widget}" does not contain its CSS file.`,
            });
        }

        return issues;
    }

    private escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}
