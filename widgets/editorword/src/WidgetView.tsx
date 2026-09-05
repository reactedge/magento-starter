import {readWidgetConfig} from "./Config.ts";
import {WidgetWordeditor} from "./components/WidgetWordeditor.tsx";
import {ActivityContextProvider} from "./activity/Context/ActivityContextProvider.tsx";

type Props = {
    contract: unknown;
    runtime: unknown;
};

export const WidgetView = ({ contract, runtime }: Props) => {

    const config = readWidgetConfig(contract, runtime);

    if (!config) return null;

    return <ActivityContextProvider>
        <WidgetWordeditor config={config} />
    </ActivityContextProvider>
};

