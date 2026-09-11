import fs from 'fs/promises';
import 'dotenv/config';
import { ReactEdgeRoot } from "@reactedge/filesystem/reactedgeRoot.ts";

export function resolveEntry(widget: string): string {
    return `${ReactEdgeRoot.get()}/widgets/${widget}/src/entrypoints/ssr.tsx`;
}

const run = async () => {
    const widgetName = process.argv[2];
    const variant = process.argv[3];

    if (!widgetName) {
        throw new Error('Missing widget name');
    }

    if (!variant) {
        throw new Error('Missing variant');
    }

    const contractJson = await readStdin();

    if (!contractJson.trim()) {
        throw new Error('Missing contract');
    }

    const config = JSON.parse(contractJson);

    let runtime = {
        rendering: {
            userAgent: process.argv[3] ?? ''
        }
    };

    const entry = resolveEntry(widgetName);

    try {
        await fs.access(entry);
    } catch {
        // eslint-disable-next-line no-console
        console.log(`Widget '${widgetName}' does not implement SSR.`);
        return;
    }

    const { renderHtml, loadRuntime } = await import(entry);

    if (loadRuntime) runtime = await loadRuntime()

    const finalHtml = renderHtml(config, runtime)

    process.stdout.write(finalHtml);
};

run();

async function readStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';

        process.stdin.setEncoding('utf8');

        process.stdin.on('data', chunk => {
            data += chunk;
        });

        process.stdin.on('end', () => {
            resolve(data);
        });

        process.stdin.on('error', reject);
    });
}