import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {trace, type Tracer} from "@opentelemetry/api";
import type {ObservabilityConfig} from "@reactedge/framework/observability/config.ts";

let tracer: Tracer;

export function setupTelemetry(runtimeConfig: ObservabilityConfig) {
    const exporter = new OTLPTraceExporter({
        url: `${runtimeConfig.endpoint}/v1/traces`
    });

    const provider = new WebTracerProvider({
        resource: resourceFromAttributes({
            'service.name': runtimeConfig.serviceName,
            'service.version': '1.0.0'
        }),
        spanProcessors: [
            new BatchSpanProcessor(exporter)
        ]
    });

    provider.register();

    tracer = trace.getTracer('reactedge-runtime');
}

export function getTracer() {
    return tracer;
}