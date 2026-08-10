/**
 * Creates and writes widget manifest files. Owns manifest serialization and storage.
 */
import {Report} from "../report.ts";
import fs from 'fs';
import {getWidgetManifestsPath} from "../paths.ts";
import {WidgetManifest} from "@reactedge/framework/contracts/WidgetManifest.ts";

export function writeManifest(
    manifest: WidgetManifest,
    name: string,
    report: Report
): string {
    report.info(
        'Writing widget manifest',
        {
            widget: name
        }
    );

    const filePath = getWidgetManifestsPath(`${name}.json`);

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            manifest,
            null,
            2
        )
    );

    report.success(
        'Widget manifest written',
        {
            widget: name,
            path: filePath
        }
    );

    return filePath;
}