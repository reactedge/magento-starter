export {};

type TurnstileApi = {
    render: (
        container: string | HTMLElement,
        options: {
            sitekey: string;
            callback?: (token: string) => void;
            "error-callback"?: () => void;
            "expired-callback"?: () => void;
        }
    ) => string;
    remove(widgetId?: string): void;
};

declare global {
    interface Window {
        __REACTEDGE_DEBUG__?: boolean;
        [key: `ReactEdge_${string}`]: WidgetApi;
        turnstile?: TurnstileApi
    }
    const __REACTEDGE_MODE__: "render" | "hydrate";
}