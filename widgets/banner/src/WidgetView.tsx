import {readWidgetConfig} from "./Config.ts";
import {BannerStatic} from "./components/BannerStatic.tsx";

type Props = {
    contract?: unknown;
};

export const WidgetView = ({ contract }: Props) => {
    const config = readWidgetConfig(contract);

    if (!config) return null;

    return <BannerStatic slides={config.slides} config={config.settings} />;
};

