import type {BootstrapData} from "./entrypoints/ssr.tsx";
import {readWidgetConfig} from "./Config.ts";
import {SelectionStateProvider} from "./state/Selection/SelectionStateProvider.tsx";
import {SystemStateProvider} from "./state/System/SystemStateProvider.tsx";
import {ProductGalleryWidget} from "./components/ProductGalleryWidget.tsx";

type Props = {
    contract: unknown;
    runtime: unknown
    bootstrapData: BootstrapData
};

export const WidgetView = ({ contract, runtime, bootstrapData }: Props) => {

    const config = readWidgetConfig(contract, runtime);

    if (!config) return null;

    return <SystemStateProvider config={config.integrations} runtime={config.runtime} >
        <SelectionStateProvider>
            <ProductGalleryWidget config={config} bootstrap={bootstrapData} />
        </SelectionStateProvider>
    </SystemStateProvider>
};

