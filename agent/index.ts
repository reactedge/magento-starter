import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// Fixed first goal: verify the build of every active widget in one environment.
// Run from the platform root: npm --prefix agent start -- default
const environment = process.argv[2] ?? 'default';
const root = fileURLToPath(new URL('../', import.meta.url));
const client = new Client({ name: 'reactedge-hello-world-agent', version: '0.1.0' });
const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--import', 'tsx', resolve(root, 'mcp/server.ts'), environment],
    cwd: root,
    stderr: 'inherit',
});

type Row = {
    instance: string;
    status: 'PASS' | 'FAIL' | 'ERROR';
    detail: string;
    result?: Record<string, unknown>;
};
const report: { environment: string; store?: string; results: Row[]; error?: string } = {
    environment,
    results: [],
};

function object(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

async function call(name: string, args: Record<string, unknown>) {
    console.error(`Calling ${name} ${JSON.stringify(args)}`);
    const response = await client.callTool(
        { name, arguments: args },
        { timeout: 60_000 },
    );
    // The existing ReactEdge tools return JSON in a text content block.
    const text = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');
    let data: unknown;
    try {
        data = response.structuredContent ?? JSON.parse(text);
    } catch {
        throw new Error(`${name} returned non-JSON content: ${text}`);
    }
    if (!object(data)) throw new Error(`${name} returned an invalid object`);
    return { data, isError: response.isError === true };
}

try {
    await client.connect(transport);
    const listed = await call('list_active_widgets', {});
    const { store, count, widgets } = listed.data;
    if (listed.isError) throw new Error(`Discovery failed: ${JSON.stringify(listed.data)}`);
    if (typeof store !== 'string' || !Array.isArray(widgets) || count !== widgets.length ||
        !widgets.every(widget => object(widget) && typeof widget.id === 'string' &&
            widget.id.length > 0 && widget.active === true)) {
        throw new Error('Invalid list_active_widgets response');
    }
    report.store = store;
    const ids = widgets.map(widget => widget.id as string);
    if (new Set(ids).size !== ids.length) throw new Error('Duplicate active widget IDs');

    for (const instance of ids) {
        try {
            const { data, isError } = await call('verify_active_widget', { instance, check: 'build' });
            if (data.instance !== instance || data.store !== store || data.check !== 'build' ||
                typeof data.passed !== 'boolean' || (isError && data.passed)) {
                throw new Error(`Invalid verification response: ${JSON.stringify(data)}`);
            }
            report.results.push({
                instance,
                status: data.passed ? 'PASS' : 'FAIL',
                detail: typeof data.error === 'string' ? data.error :
                    data.passed ? 'Build and manifest checks passed' : 'Build verification failed',
                result: data,
            });
        } catch (error) {
            report.results.push({ instance, status: 'ERROR', detail: message(error) });
        }
    }
} catch (error) {
    report.error = message(error);
} finally {
    try {
        await client.close();
    } catch (error) {
        report.error = [report.error, `MCP cleanup failed: ${message(error)}`].filter(Boolean).join('; ');
    }
    console.log(JSON.stringify({
        ...report,
        summary: {
            checked: report.results.length,
            passed: report.results.filter(row => row.status === 'PASS').length,
            failed: report.results.filter(row => row.status === 'FAIL').length,
            errors: report.results.filter(row => row.status === 'ERROR').length,
        },
        outcome: report.error ? 'ERROR' : report.results.length === 0 ? 'NO_ACTIVE_WIDGETS' :
            report.results.every(row => row.status === 'PASS') ? 'PASS' : 'FAIL',
    }, null, 2));
    process.exitCode = report.error || report.results.some(row => row.status !== 'PASS') ? 1 : 0;
}
