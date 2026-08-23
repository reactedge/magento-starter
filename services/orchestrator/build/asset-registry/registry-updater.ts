import path from "path";
import {readFileSync} from "fs";
import {getConfig} from "../../config.ts";

export function updateRegistry({ widgetName, buildTarget, registryPath, widgetAssetsDir }) {
    const CONFIG = getConfig()

    const manifestPath = path.join(widgetAssetsDir, `widget-${buildTarget}.manifest.json`);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    const { filename, hash, cssFilename } = manifest;

    if (!filename) {
        throw new Error(`Missing filename in manifest`);
    }

    const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));

    if (!registry[widgetName]) {
        throw new Error(`Widget "${widgetName}" not found in registry`);
    }

    const entry = registry[widgetName];

    // ✅ backward-compatible base resolution
    const baseEntry = registry[buildTarget];

    const newSrc = filename;

    if (CONFIG.ssrEnabled) {
        entry.src = 'index.ts';
    } else {
        entry.src = newSrc;
    }

    if (CONFIG.updateIntegrity && hash) {
        entry.integrity = hash;
    }

    const contract = `/${buildTarget}/contracts/${entry.contract}`;

    return { src: newSrc, hash, contract, cssFilename, integrity: entry.integrity };
}