export type WorkspaceValidationIssueType =
    | "invalid-url"
    | "missing-registry"
    | "invalid-registry"
    | "missing-contract-directory"
    | "missing-contract"
    | "invalid-contract"
    | "missing-release-directory"
    | "missing-bundle"
    | "missing-index"
    | "missing-css";

export interface WorkspaceValidationIssue {
    type: WorkspaceValidationIssueType;
    message: string;
    widget?: string;
    instance?: string;
    file?: string;
    path?: string;
    expected?: string;
    actual?: string;
    suggestedFix?: string;
}

export interface StoreWorkspaceValidationResult {
    store: string;
    valid: boolean;
    error?: string;
    issues: WorkspaceValidationIssue[];
}

export type WorkspaceHostEnvironment = "php" | "javascript";

export interface RegistryWidgetEntry {
    instance: string;
    widget: string;
    contractFile: string;
}
