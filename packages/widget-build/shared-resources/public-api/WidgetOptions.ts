export interface StaticWidgetOptions {
    container: HTMLElement;
    contract: unknown;
    hydrate?: boolean;
}

export interface RuntimeWidgetOptions extends StaticWidgetOptions {
    runtime: unknown;
}