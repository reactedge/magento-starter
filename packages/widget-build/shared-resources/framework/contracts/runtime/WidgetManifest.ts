import type {SsrViewMap} from "@reactedge/framework/contracts/buiild/WidgetSsrConfig";

export interface WidgetManifest {
    id: string;
    widget: string;
    widgetVersion?: string;
    contractVersion?: number | null;
    src: string;
    css?: string | null,
    ssr: {
        views: SsrViewMap,
        css?: string | null;
        strategy: 'static' | 'dynamic' | 'disabled';
    };
    integrity?: string | null;
    contract?: Record<string, unknown>;
    contractFile?: string | null;
}