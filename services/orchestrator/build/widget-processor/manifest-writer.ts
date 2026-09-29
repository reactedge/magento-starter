/**
 * Creates and writes widget manifest files. Owns manifest serialization and storage.
 */
import fs from 'fs';
import type {Report} from "../../deployment/report.ts";
import {BuildPaths} from "../paths.ts";
import type {WidgetManifest} from "@reactedge/framework/contracts/WidgetManifest.ts";

export class ManifestWriter {
    constructor(
        private readonly report: Report,
        private readonly paths: BuildPaths = new BuildPaths()
    ) {}

    write(
        manifest: WidgetManifest,
        name: string
    ): string {
        this.report.info(
            'Writing widget manifest',
            {
                widget: name
            }
        );

        const filePath = this.paths.getWidgetManifestsPath(`${name}.json`);

        fs.writeFileSync(
            filePath,
            JSON.stringify(
                manifest,
                null,
                2
            )
        );

        this.report.success(
            'Widget manifest written',
            {
                widget: name,
                path: filePath
            }
        );

        return filePath;
    }
}
