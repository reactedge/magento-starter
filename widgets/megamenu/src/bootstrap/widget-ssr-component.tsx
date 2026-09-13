import {WIDGET_ID} from "../Config.ts";
import {WidgetView} from "../WidgetView.tsx";
interface WidgetRootProps {
    contract: unknown;
    bootstrap: unknown;
    hostElement?: HTMLElement;
}

export function WidgetComponent({
       contract,
       bootstrap
   }: WidgetRootProps) {
    return (
        <div className={`reactedge-${WIDGET_ID}`}>
            <WidgetView contract={contract} bootstrap={bootstrap} />
        </div>
    );
}