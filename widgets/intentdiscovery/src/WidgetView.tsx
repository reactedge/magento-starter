import type {BootstrapData} from "./entrypoints/ssr.tsx";
import {readWidgetConfig} from "./Config.ts";
import {SystemStateProvider} from "./state/System/SystemStateProvider.tsx";
import {TranslationStateProvider} from "./state/Translation/TranslationStateProvider.tsx";
import {IntentLookup} from "./components/IntentLookup.tsx";

type Props = {
    contract: unknown;
    runtime: unknown;
    bootstrapData: BootstrapData;
};

export const WidgetView = ({ contract, runtime, bootstrapData }: Props) => {

    const config = readWidgetConfig(contract, runtime);

    if (!config) return null;

    return <SystemStateProvider config={config.integrations} runtimeConfig={config.runtime} bootstrap={bootstrapData}>
            <TranslationStateProvider translations={config.translations}>
                <div className="intent-widget-container">
                    <IntentLookup config={config} />
                </div>
            </TranslationStateProvider>
    </SystemStateProvider>
};

