import {WidgetRoot} from "./bootstrap/widget-root.tsx";
import {createRoot, hydrateRoot} from "react-dom/client";
import type {StaticWidgetOptions} from "@reactedge/public-api/WidgetOptions.ts";

export function Widget({
       container,
       contract,
       hydrate = false,
   }: StaticWidgetOptions) {
    const element = (
        <WidgetRoot contract={contract} />
    );

    if (hydrate) {
        hydrateRoot(container, element);
    } else {
        createRoot(container).render(element);
    }
}