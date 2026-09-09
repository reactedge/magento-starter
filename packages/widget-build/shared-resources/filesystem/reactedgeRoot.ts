import { execSync } from "node:child_process";

export class ReactEdgeRoot {
    static get(): string {
        const configuredRoot = process.env.REACTEDGE_ROOT;

        if (configuredRoot) {
            return configuredRoot;
        }

        return execSync(
            "git rev-parse --show-toplevel",
            { encoding: "utf8" }
        ).trim();
    }
}