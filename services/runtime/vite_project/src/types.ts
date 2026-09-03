import type {WidgetManifest} from "@reactedge/framework/contracts/runtime/WidgetManifest.ts";

export interface WidgetModule {
    mount(
        container: HTMLElement,
        contract: unknown,
        runtime: unknown
    ): void | Promise<void>;
}

export interface ResolvedWidget {
    type: string;
    entry: WidgetManifest;
}

export type WidgetGlobalKey = `ReactEdge_${string}`;

export type DebugMode =
    | "runtime"
    | null;

export type OnScrollMode = `on-scroll:${number}`

export type WidgetLoadMode =
    | "lazy"
    | "critical"
    | "eager"
    | "ssr"
    | OnScrollMode;