/**
 * Loads CSS content used during SSR.
 *
 * Reads the generated CSS bundle and returns
 * the raw CSS content to embed in manifest.
 */
import fs from 'fs';
import path from 'path';
import {getWidgetAssetsPath} from "../paths.ts";

export function loadSsrCss(
    widgetName: string,
    cssSsrFilename?: string
): string | null {
    const widgetAssetsDir =
        getWidgetAssetsPath(
            widgetName
        );

    if (!cssSsrFilename) {
        return null;
    }

    try {
        return fs.readFileSync(
            path.join(
                widgetAssetsDir,
                cssSsrFilename
            ),
            'utf-8'
        );
    } catch {
        return null;
    }
}