import {readWidgetConfig} from "./Config.ts";
import {SelectionStateProvider} from "./state/Selection/SelectionStateProvider.tsx";
import {SystemStateProvider} from "./state/System/SystemStateProvider.tsx";
import {ProductGalleryWidget} from "./components/ProductGalleryWidget.tsx";

type Props = {
    contract: unknown;
    runtime: unknown;
};

export const WidgetView = ({ contract, runtime }: Props) => {

    const config = readWidgetConfig(contract, runtime);

    if (!config) return null;

    const bootstrapData = {galleryData : config.tiles}

    return <SystemStateProvider config={config.integrations} runtime={config.runtime} >
        <SelectionStateProvider>
            <ProductGalleryWidget config={config} bootstrap={bootstrapData} />
        </SelectionStateProvider>
    </SystemStateProvider>
};

