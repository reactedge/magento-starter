import {
    existsSync,
    readdirSync,
    readFileSync,
} from "node:fs";
import { resolve } from "node:path";

export interface Capability {
    id: string;
    widget: string;
    description: string;
    contractFile: string;

    signals: {
        consumes: string[];
        emits: string[];
    };

    runtime: {
        rendering: string[];
    };
}

export class WidgetRegistry {
    private readonly repositoryRoot: string;

    constructor(repositoryRoot: string) {
        this.repositoryRoot = repositoryRoot;
    }

    list(): Capability[] {
        const widgetsRoot = resolve(
            this.repositoryRoot,
            "widgets",
        );

        const capabilities: Capability[] = [];

        for (const entry of readdirSync(widgetsRoot, {
            withFileTypes: true,
        })) {
            if (!entry.isDirectory()) {
                continue;
            }

            const capability = this.get(entry.name);

            if (capability) {
                capabilities.push(capability);
            }
        }

        return capabilities;
    }

    get(widget: string): Capability | null {
        const capabilityFile = resolve(
            this.repositoryRoot,
            "widgets",
            widget,
            "capability.json",
        );

        if (!existsSync(capabilityFile)) {
            return null;
        }

        return JSON.parse(
            readFileSync(capabilityFile, "utf8"),
        ) as Capability;
    }
}