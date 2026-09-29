import type { Row } from './index.js';

type WorkflowContext = {
    call: (name: string, args: Record<string, unknown>) => Promise<{
        data: Record<string, unknown>;
        isError: boolean;
    }>;
    report: { store?: string; results: Row[] };
    object: (value: unknown) => value is Record<string, unknown>;
    message: (error: unknown) => string;
};

// Add or change the goal's MCP actions here. The runner owns the lifecycle.
export async function runWorkflow({ call, report, object, message }: WorkflowContext): Promise<void> {
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
        for (const check of ['build', 'test'] as const) {
            try {
                const { data, isError } = await call('verify_active_widget', { instance, check });
                if (data.instance !== instance || data.store !== store || data.check !== check ||
                    typeof data.passed !== 'boolean' || (isError && data.passed)) {
                    throw new Error(`Invalid verification response: ${JSON.stringify(data)}`);
                }
                const detail = typeof data.error === 'string' ? data.error :
                    data.passed ? 'Verification passed' : 'Verification failed';
                report.results.push({
                    instance,
                    status: data.passed ? 'PASS' : 'FAIL',
                    detail: `${check}: ${detail}`,
                    result: data,
                });
            } catch (error) {
                report.results.push({
                    instance,
                    status: 'ERROR',
                    detail: `${check}: ${message(error)}`,
                    result: { instance, store, check },
                });
            }
        }
    }
}
