import {WIDGET_ID} from "../Config.ts";
import {WidgetView} from "../WidgetView.tsx";

interface WidgetRootProps {
    contract: unknown;
    hostElement?: HTMLElement;
}

export function WidgetComponent({
       contract
   }: WidgetRootProps) {
    const runtime = {
        rendering: {
            userAgent: 'desktop'
        }}

    return (
        <div data-reactedge-ssr className={`reactedge-${WIDGET_ID}`}>
            <WidgetView contract={contract} runtime={runtime} />
        </div>
    );
}