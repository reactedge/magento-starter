import {
    context,
    isSpanContextValid,
    trace,
    TraceFlags,
    type Context,
    type Span,
    type SpanContext
} from "@opentelemetry/api";
import {getTracer} from "./telemetry.ts";

interface ServerPageTracePayload {
    renderId?: unknown;
    traceId?: unknown;
    spanId?: unknown;
    traceFlags?: unknown;
}

interface ServerPageTraceContext {
    present: boolean;
    renderId?: string;
    spanContext?: SpanContext;
}

let pageSpan: Span | undefined;
let pageContext: Context | undefined;

export function startPageActivity(): void {
    const serverContext = readServerPageTraceContext();

    const attributes: Record<string, string | number | boolean> = {
        'url.path': window.location.pathname,
        'user_agent.original': navigator.userAgent,
        'reactedge.server_trace.present': serverContext.present,
        'reactedge.server_trace.linked': serverContext.spanContext !== undefined
    };

    if (serverContext.renderId) {
        attributes['reactedge.render.id'] = serverContext.renderId;
    }

    pageSpan = getTracer().startSpan(
        'reactedge.page.load',
        {
            attributes,
            links: serverContext.spanContext
                ? [{
                    context: serverContext.spanContext,
                    attributes: {
                        'reactedge.link.type': 'server-render'
                    }
                }]
                : []
        }
    );

    pageContext = trace.setSpan(
        context.active(),
        pageSpan
    );
}

export function finishPageActivity(): void {
    pageSpan?.end();
    pageSpan = undefined;
}

export function getPageContext(): Context | undefined {
    return pageContext;
}

function readServerPageTraceContext(): ServerPageTraceContext {
    const element = document.getElementById('reactedge-observability');

    if (!element?.textContent) {
        return {present: false};
    }

    try {
        const payload = JSON.parse(element.textContent) as ServerPageTracePayload;
        const renderId = typeof payload.renderId === 'string'
            ? payload.renderId
            : undefined;

        if (
            typeof payload.traceId !== 'string'
            || typeof payload.spanId !== 'string'
        ) {
            return {
                present: true,
                renderId
            };
        }

        const traceFlags = payload.traceFlags === TraceFlags.SAMPLED
            ? TraceFlags.SAMPLED
            : TraceFlags.NONE;

        const spanContext: SpanContext = {
            traceId: payload.traceId,
            spanId: payload.spanId,
            traceFlags,
            isRemote: true
        };

        if (!isSpanContextValid(spanContext)) {
            return {
                present: true,
                renderId
            };
        }

        return {
            present: true,
            renderId,
            spanContext
        };
    } catch {
        return {present: true};
    }
}
