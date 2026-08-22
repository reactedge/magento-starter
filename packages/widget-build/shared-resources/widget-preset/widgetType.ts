import {existsSync} from "node:fs";
import {resolve} from "node:path";

export type WidgetType = 'standard' | 'runtime';

export function getWidgetType(widgetRoot: string): WidgetType {
    const standard = existsSync(
        resolve(widgetRoot, 'api/widget.tsx'),
    );

    const runtime = existsSync(
        resolve(widgetRoot, 'api/runtime-widget.tsx'),
    );

    if (standard === runtime) {
        throw new Error(
            standard
                ? 'Widget contains both standard and runtime API entrypoints'
                : 'Widget contains neither standard nor runtime API entrypoint',
        );
    }

    return runtime ? 'runtime' : 'standard';
}