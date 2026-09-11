import {useActivityContext} from "../activity/Context/useActivityContext.ts";
import {readWidgetConfig} from "../Config.ts";
import {SystemStateProvider} from "../state/System/SystemStateProvider.tsx";
import {ProductGalleryWidget} from "../components/ProductGalleryWidget.tsx";
import {SelectionStateProvider} from "../state/Selection/SelectionStateProvider.tsx";

type Props = {
    contract: unknown,
    runtime: unknown;
}

export default function WidgetWrapper({contract, runtime}: Props) {
    const activity = useActivityContext()
    const config = readWidgetConfig(contract, runtime, activity);

    if (!config) return null;

    return <SystemStateProvider config={config.integrations} runtime={config.runtime} activity={activity}>
            <SelectionStateProvider activity={activity}>
                <ProductGalleryWidget
                    config={config}
                    onReady={() => activity.ready()}/>
            </SelectionStateProvider>
    </SystemStateProvider>
}