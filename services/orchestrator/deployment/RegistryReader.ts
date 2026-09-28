import fs from "fs";
import { RegistrySchema } from "./schema.ts";
import { getRegistryPath } from "../build/paths.ts";
import type { BuildWidgetRegistry } from "@reactedge/framework/contracts/buiild/BuildWidgetRegistry.ts";

export class RegistryReader {
    read(): BuildWidgetRegistry {
        const registryPath = getRegistryPath();

        const rawRegistry = JSON.parse(
            fs.readFileSync(registryPath, 'utf-8')
        );

        return RegistrySchema.parse(rawRegistry);
    }
}
