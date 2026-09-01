import type {MagentoLayeredNavigation} from "../../types/domain/layered-data.types.ts";

export function computeAiReadiness(
    configuredLayeredAttributes: MagentoLayeredNavigation,
    attributeLayerData: MagentoLayeredNavigation,
    threshold: number
): number {
    if (configuredLayeredAttributes === undefined) {
        return 100;
    }

    const base = configuredLayeredAttributes.totalCount ?? 0;
    const filtered = attributeLayerData.totalCount ?? 0;

    if (!base || !filtered || base === filtered) {
        return 0;
    }

    const fullCoverage = base - threshold;
    const currentCoverage = filtered - threshold;

    if (currentCoverage < 0) {
        return 100;
    }

    const coverage = currentCoverage / fullCoverage;
    return Math.round(coverage * 100);
}