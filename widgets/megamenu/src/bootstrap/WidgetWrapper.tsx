import {useActivityContext} from "../activity/Context/useActivityContext.ts";
import {readWidgetConfig} from "../Config.ts";
import {useMediaQuery} from "../hooks/ui/useMediaQuery.tsx";
import {ConfigStateProvider} from "../state/Config/ConfigStateProvider.tsx";
import {MegamenuContent} from "../components/MegamenuContent.tsx";
import {MobileMegamenu} from "../components/MobileMegamenu.tsx";
import {useEffect} from "react";

type Props = {
    contract?: unknown
}

export function WidgetWrapper({contract}: Props) {
    const activity = useActivityContext()
    const config = readWidgetConfig(contract, activity);
    const isMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        if (config) {
            activity.ready();
        }
    }, [config, activity]);

    if (!config) return null;

    return <ConfigStateProvider settings={config?.settings?.theme}>
        {!isMobile && <MegamenuContent items={config?.data.items} theme={config.settings?.theme} />}
        {isMobile && <MobileMegamenu items={config?.data.items} theme={config.settings?.theme} />}
    </ConfigStateProvider>;
}
