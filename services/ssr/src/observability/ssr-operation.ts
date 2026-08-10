import {logger} from "../logger";

export class SsrRenderOperation {
    private requestId: string;
    private traceId: string;
    private parentSpanId: string;

    constructor() {}

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
}