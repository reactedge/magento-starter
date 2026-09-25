import {existsSync} from "node:fs";
import {resolve} from "node:path";
import {ContractValidator} from "./ContractValidator";
import {RegistryValidator} from "./RegistryValidator";
import {ReleaseArtifactValidator} from "./ReleaseArtifactValidator";
import {WorkspaceUrlValidator} from "./WorkspaceUrlValidator";
import type {
    StoreWorkspaceValidationResult,
    WorkspaceHostEnvironment,
    WorkspaceValidationIssue,
} from "./WorkspaceValidation";

export class StoreWorkspaceValidator {
    private readonly urlValidator: WorkspaceUrlValidator;
    private readonly registryValidator: RegistryValidator;
    private readonly contractValidator: ContractValidator;
    private readonly releaseValidator: ReleaseArtifactValidator;

    constructor(
        private readonly repositoryRoot: string,
    ) {
        this.urlValidator = new WorkspaceUrlValidator();
        this.registryValidator = new RegistryValidator();
        this.contractValidator = new ContractValidator(repositoryRoot);
        this.releaseValidator = new ReleaseArtifactValidator(repositoryRoot);
    }

    async validate(
        store: string,
        targetSiteUrl: string,
        environment: WorkspaceHostEnvironment,
    ): Promise<StoreWorkspaceValidationResult> {
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
                issues: [],
            };
        }

        const issues: WorkspaceValidationIssue[] = [
            ...this.urlValidator.validate(
                storeRoot,
                targetSiteUrl,
            ),
        ];

        const registryResult =
            this.registryValidator.validate(storeRoot);

        issues.push(...registryResult.issues);

        for (const entry of registryResult.widgets) {
            issues.push(
                ...await this.contractValidator.validate(
                    storeRoot,
                    entry,
                ),
            );

            issues.push(
                ...this.releaseValidator.validate(
                    entry,
                    environment,
                ),
            );
        }

        return {
            store,
            valid: issues.length === 0,
            issues,
        };
    }
}

export type {
    StoreWorkspaceValidationResult,
    WorkspaceHostEnvironment,
    WorkspaceValidationIssue,
} from "./WorkspaceValidation";
