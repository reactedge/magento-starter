import {useMemo} from "react";
import type {OptionLabelMap} from "../../domain/intent-discovery.types.ts";
import type { MergedAttribute} from "../../types/infra/magento/attribute.types.ts";

export function useOptionLabelMap(
    attributes?: MergedAttribute[] | null
): OptionLabelMap {
    return useMemo(() => {
        if (!attributes) return new Map();

        const map: OptionLabelMap = new Map<string, Map<string, string>>();

        for (const attribute of attributes) {
            const optionMap = new Map<string, string>();

            for (const opt of attribute.options) {
                optionMap.set(opt.value, opt.label);
            }

            map.set(attribute.code, optionMap);
        }

        return map;

    }, [attributes]);
}