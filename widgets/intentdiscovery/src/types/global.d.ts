export {};

interface ReactEdgeIntentApi {
    emit: (intent: string) => void;
}

declare global {
    interface Window {
        __REACTEDGE_DEBUG__?: boolean;
        [key: `ReactEdge_${string}`]: WidgetApi;
        ReactEdgeIntent?: ReactEdgeIntentApi
    }
    const __REACTEDGE_MODE__: "render" | "hydrate";
}