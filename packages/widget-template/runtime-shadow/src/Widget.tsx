import {WidgetRoot} from "./bootstrap/widget-root.tsx";
import {createRoot, hydrateRoot} from "react-dom/client";
import type {RuntimeWidgetOptions} from "@reactedge/public-api/WidgetOptions.ts";

import { styles } from "./styles/entry.ts";
import {ShadowHostProvider} from "@reactedge/framework/host.ts";

const hostProvider = new ShadowHostProvider(styles);

export function Widget({
   container,
   contract,
   runtime,
   hydrate = false,
}: RuntimeWidgetOptions) {
    const host = hostProvider.getMountedHost(container);

    const element = (
        <WidgetRoot contract={contract} runtime={runtime} />
    );

    if (hydrate) {
        hydrateRoot(host, element);
    } else {
        createRoot(host).render(element);
    }
}