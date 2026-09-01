import { existsSync } from "node:fs";
import { resolve } from "node:path";

export type WidgetType =
    | "standard"
    | "runtime"
    | "runtime-shadow";

export function getWidgetType(widgetRoot: string): WidgetType {
    const entrypoints: Record<WidgetType, boolean> = {
        standard: existsSync(
            resolve(widgetRoot, "api/widget.tsx")
        ),
        runtime: existsSync(
            resolve(widgetRoot, "api/runtime-widget.tsx")
        ),
        "runtime-shadow": existsSync(
            resolve(widgetRoot, "api/runtime-shadow-widget.tsx")
        ),
    };

    const detected = Object.entries(entrypoints)
        .filter(([, exists]) => exists)
        .map(([type]) => type as WidgetType);

    if (detected.length === 0) {
        throw new Error(
            "Widget contains no recognised API entrypoint"
        );
    }

    if (detected.length > 1) {
        throw new Error(
            `Widget contains multiple API entrypoints: ${detected.join(", ")}`
        );
    }

    return detected[0];
}