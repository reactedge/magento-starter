import { useEffect, useState, useCallback } from "react";
import type { CategoryData } from "../../types/infra/magento/category.types.ts";
import { useSystemState } from "../../state/System/useSystemState.ts";
import { getError } from "../../lib/error.ts";
import { getConfiguredLayeredNavigation } from "../../services/layeredNavigation/configuredLayeredNavigation.service.ts";
import type { LayeredNavigationResult } from "../../types/domain/layered-data.types.ts"
import type { MagentoLayeredNavigation } from "../../types/domain/layered-data.types.ts"

export const useConfiguredLayeredNavigation = (
    categoryData: CategoryData
): LayeredNavigationResult => {
    const { graphqlClient, bootstrap } = useSystemState()
    const initialData = bootstrap?.layeredData

    const shouldFetch =
        !initialData;

    const [data, setData] = useState<MagentoLayeredNavigation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async (isCancelled?: () => boolean) => {
        try {
            setLoading(true);
            setError(null);

            const data = await getConfiguredLayeredNavigation(
                categoryData,
                graphqlClient
            )

            if (isCancelled?.()) return

            setData(data);
        } catch (err: unknown) {
            if (isCancelled?.()) return

            setData(null);
            setError(getError(err));
        } finally {
            setLoading(false);
        }
    }, [
        categoryData,
        graphqlClient
    ])

    useEffect(() => {
        let cancelled = false

        if (!shouldFetch) return;

        ; (async () => {
            await execute(() => cancelled)
        })()

        return () => {
            cancelled = true
        }
    }, [categoryData, graphqlClient, execute, shouldFetch])

    const refetch = () => execute()

    return {
        attributeLayerData: initialData ?? data,
        attributeLayerLoading: loading,
        attributeLayerError: error,
        refetch
    }
}