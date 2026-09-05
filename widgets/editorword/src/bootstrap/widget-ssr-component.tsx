import { WIDGET_ID } from "../Config.ts";
import { WidgetView } from "../WidgetView.tsx";

interface WidgetRootProps {
    contract: unknown;
    runtime: unknown;
    hostElement?: HTMLElement;
}

export function WidgetComponent({
    contract,
    runtime
}: WidgetRootProps) {
    return (
        <div className={`reactedge-${WIDGET_ID}`}>
            <WidgetView contract={contract} runtime={runtime} />
        </div>
    );
}