import type { Config } from "../build/types.ts";
import { DeploymentEnvironment } from "./DeploymentEnvironment.ts";

const deploymentEnvironment = new DeploymentEnvironment();

export function loadConfig(
    envFile: string
): void {
    deploymentEnvironment.load(envFile);
}

export function getConfig(): Config {
    return deploymentEnvironment.get();
}
