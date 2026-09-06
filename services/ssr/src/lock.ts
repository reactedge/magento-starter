import type {LockOperationContract} from "./observability/lock-operation";

let renderLock: Promise<void> = Promise.resolve();

export async function withRenderLock<T>(
    lockOperation: LockOperationContract,
    fn: () => Promise<T>
): Promise<T> {
    lockOperation.registerStart();

    const previous = renderLock;
    let release!: () => void;

    renderLock = new Promise<void>(resolve => {
        release = resolve;
    });

    await previous;
    await new Promise(resolve => setTimeout(resolve, 3000));

    lockOperation.logLockAcquired();

    try {
        return await fn();
    } catch (e) {
        lockOperation.logFailedLock(e)
    } finally {
        release();
    }
}