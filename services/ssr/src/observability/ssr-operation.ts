import {OpenTelemetryObserver} from "./activity";
import {logger} from "../logger";
import type {Span} from "@opentelemetry/api";
import type {LockOperationContract} from "./lock-operation";
import {LockOperation, NoopLockOperation} from "./lock-operation";

export interface RenderOperation {
    registerStart(headers: Record<string, unknown>): void;
    logPayload(payload: unknown): void;
    logWidgetImported(): void;
    logRenderingStarted(): void;
    logCompletion(htmlLength: number): void;
    logResponseSent(waitingLock: number): void;
    logFailedSsr(error: unknown): void;
    getRequestId(): string;
}

type Operations = {
    render: RenderOperation;
    lock: LockOperationContract;
};

export function createOperations(
    observabilityEnabled: boolean
): Operations {
    if (!observabilityEnabled) {
        return {
            render: new NoopRenderOperation(),
            lock: new NoopLockOperation(),
        };
    }

    const render = new SsrRenderOperation();

    return {
        render,
        lock: new LockOperation(render),
    };
}

export class NoopRenderOperation implements RenderOperation {
    private requestId: string;
    private traceId: string;
    private parentSpanId: string;

    logPayload(): void {}
    logResponseSent(): void {}

    registerStart(headers: Record<string, unknown>): void {
        this.traceId = headers["x-trace-id"] ?? "";
        this.parentSpanId = headers["x-parent-span-id"] ?? "";
        this.requestId = crypto.randomUUID();

        logger.info("[SSR START]", {
            requestId: this.requestId,
            traceId: this.traceId,
            parentSpanId: this.parentSpanId,
        });
    }

    logWidgetImported() {
        logger.info("[SSR] widget imported", {
            requestId: this.requestId,
        });
    }

    logRenderingStarted() {
        logger.info("[SSR] rendering started", {
            requestId: this.requestId,
        });
    }

    logCompletion(resultLength: number) {
        logger.info("[SSR COMPLETE]", {
            requestId: this.requestId,
            responseSize: resultLength,
        });
    }

    logFailedSsr(error: unknown): void {
        logger.error("[SSR FAILED]", {
            requestId: this.requestId,
            error,
        });
    }
    getRequestId(): string {
        return "observability-disabled";
    }
}

export class SsrRenderOperation {
    private readonly telemetry;

    private requestId: string;

    private userAgent: string;

    private traceId: string;

    private parentSpanId: string;

    private span: Span

    constructor() {
        this.telemetry =
            new OpenTelemetryObserver();
    }

    registerStart(headers: Record<string, unknown>): void {
        this.traceId = headers['x-trace-id'] ?? '';
        this.parentSpanId = headers['x-parent-span-id'] ?? '';
        this.userAgent = headers['user-agent']?? ''
        this.requestId = crypto.randomUUID();

        this.span = this.telemetry.startRemoteOperation(
            'ssr.render',
            this.traceId,
            this.parentSpanId
        );

        logger.info('[SSR START]', {
            requestId: this.requestId,
            traceId: this.traceId,
            parentSpanId: this.parentSpanId,
        });
    }

    logPayload(payload: { contract: unknown; contractFile: string; runtimeConfig: unknown; widget: string; widgetId: string }) {
        logger.info('[SSR PAYLOAD]', {
            requestId: this.requestId,
            widget: payload.widget,
            contractFile: payload.contractFile,
            runtime: payload.runtimeConfig,
            userAgent: this.userAgent
        });

        this.telemetry.addEvent('payload.loaded', {
            requestId: this.requestId,
            widget: payload.widget,
            contractFile: payload.contractFile,
            runtime: payload.runtimeConfig,
            userAgent: this.userAgent
        })
    }

    logWidgetImported() {
        this.telemetry.addEvent('widget.imported', {})
    }

    logRenderingStarted() {
        this.telemetry.addEvent('widget.ssr.started', {})
    }

    logResponseSent(waitingLock: number) {
        logger.info('[SSR DONE]', {
            requestId: this.requestId
        });

        this.telemetry.addEvent('lock.wait.ms', { waitingLock })
        this.telemetry.addEvent('widget.ssr.sent', {})
        this.telemetry.endOperation()
    }

    logCompletion(resultLength: number) {
        logger.info('[SSR DONE]', {
            requestId: this.requestId,
            responseSize: resultLength
        });
        this.telemetry.addEvent('widget.ssr.completed', {
            resultLength
        })
    }

    logFailedSsr(
        error: unknown
    ): void {
        this.telemetry.failOperation(error)
    }

    getRequestId() {
        return this.requestId
    }

    addEvent(name: string, payload?: unknown) {
        this.telemetry.addEvent(name, payload)
    }

    getSpan() {
        return this.span
    }
}