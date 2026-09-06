import {OpenTelemetryObserver} from "./activity";
import {logger} from "../logger";
import type {RenderOperation, SsrRenderOperation} from "./ssr-operation";

export interface LockOperationContract {
    registerStart(): void;
    logFailedLock(error: unknown): void;
    logLockAcquired(): void;
    addEvent(name: string, payload?: unknown): void;
    getWaitingLock(): number | undefined;
}

export class NoopLockOperation implements LockOperationContract {
    registerStart(): void {}

    logFailedLock(): void {}

    logLockAcquired(): void;

    addEvent(): void {}

    getWaitingLock(): undefined {
        return undefined;
    }
}

export class LockOperation {
    private readonly telemetry;

    private readonly ssrOperation: RenderOperation

    private start: number

    private waitingDelay: number

    constructor(ssrOperation: SsrRenderOperation) {
        this.telemetry =
            new OpenTelemetryObserver();
        this.ssrOperation = ssrOperation
    }

    registerStart(): void {
        const spanContext = this.ssrOperation.getSpan().spanContext();

        const parentSpanId = spanContext.spanId;
        const traceId = spanContext.traceId;

        this.start = performance.now();

        this.telemetry.startOperation(
            'ssr.lock.wait',
            traceId,
            parentSpanId
        );

        logger.info('[LOCK START]', {
            traceId,
            parentSpanId,
        });
    }

    logLockAcquired() {
        logger.info('[LOCK ACQUIRED]', {});

        this.waitingDelay = performance.now() - this.start

        this.telemetry.addEvent(
            "ssr.lock.acquired", {
                waitMs: this.waitingDelay
            }
        );

        this.telemetry.endOperation()
    }

    logFailedLock(
        error: unknown
    ): void {
        this.telemetry.failOperation(error)
    }

    addEvent(name: string, payload?: unknown) {
        this.telemetry.addEvent(name, payload)
    }

    getWaitingLock() {
        return this.waitingDelay;
    }
}