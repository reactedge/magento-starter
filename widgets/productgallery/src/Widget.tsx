import {WidgetRoot} from "./bootstrap/widget-root.tsx";
import {createRoot, hydrateRoot} from "react-dom/client";
import type {RuntimeWidgetOptions} from "@reactedge/public-api/WidgetOptions.ts";

export function Widget({
   container,
   contract,
   runtime,
   hydrate = false,
}: RuntimeWidgetOptions) {
    const element = (
        <WidgetRoot contract={contract} runtime={runtime} />
    );

    if (hydrate) {
        hydrateRoot(container, element);
    } else {
        createRoot(container).render(element);
    }
}