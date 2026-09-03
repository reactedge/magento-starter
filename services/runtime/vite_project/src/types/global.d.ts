import type {ReactEdgeRuntime} from "../runtime.ts";

export {};

declare global {
    interface Window {
        ReactEdgeRuntime: ReactEdgeRuntime;
        [key: `ReactEdge_${string}`]: WidgetModule | undefined;
    }
}
