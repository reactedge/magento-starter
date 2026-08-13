import  type {WidgetSsrConfig} from "@reactedge/framework/contracts/buiild/WidgetSsrConfig";
import type {WidgetImageOptimisationConfig} from "@reactedge/framework/contracts/buiild/BuildWidgetRegistry";

export interface WidgetRegistryEntry {
    active: boolean;
    widget?: string;
    contract: string;
    css?: string;
    ssr?: WidgetSsrConfig;
    imageOptimisation?: WidgetImageOptimisationConfig;
}