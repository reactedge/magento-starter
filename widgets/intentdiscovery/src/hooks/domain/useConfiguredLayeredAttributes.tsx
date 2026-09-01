import {useEffect, useState} from "react";
import type {CategoryData} from "../../types/infra/magento/category.types.ts";
import {useSystemState} from "../../state/System/useSystemState.ts";
import {getError} from "../../lib/error.ts";
import type {IntentDiscoveryDataConfig} from "../../domain/intent-discovery.types.ts";
import {getConfiguredLayeredNavigation} from "../../services/layeredNavigation/configuredLayeredNavigation.service.ts";
import type { LayeredNavigationResult } from "../../types/domain/configured.attribute.ts"

export const useConfiguredLayeredNavigation = (
    categoryData: CategoryData,
    config: IntentDiscoveryDataConfig
): LayeredNavigationResult => {
    const { graphqlClient, bootstrap } = useSystemState()
    const initialData = bootstrap?.layeredData

    const shouldFetch =
        !initialData;

    const [data, setData] = useState<MagentoLayeredNavigation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false

        if (!shouldFetch) return ;

        const execute = async (isCancelled?: () => boolean) => {
            try {
                setLoading(true);
                setError(null);

                const data = await getConfiguredLayeredNavigation(
                    categoryData,
                    graphqlClient,
                    config
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
        }

        ;(async () => {
            await execute(() => cancelled)
        })()

        return () => {
            cancelled = true
        }
    }, [categoryData, graphqlClient, shouldFetch, config])

    const refetch = () => execute()

    return {
        attributeLayerData: initialData ?? data,
        attributeLayerLoading: loading,
        attributeLayerError: error,
        refetch
    }
}