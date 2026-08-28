export {};

declare global {
    interface Window {
        captureReactEdgeSignal: (signal: unknown) => Promise<void>;
    }
}