import {getLayeredNavigation} from "../../services/layeredNavigation/layeredNavigation.service.ts";
import {useEffect, useState} from "react";
import type {CategoryData} from "../../types/infra/magento/category.types.ts";
import type {IntentEngineState} from "../../integration/intent/types.ts";
import {useSystemState} from "../../state/System/useSystemState.ts";
import {getError} from "../../lib/error.ts";
import type {IntentDiscoveryDataConfig} from "../../domain/intent-discovery.types.ts";
import {useIntentState} from "../../state/Intent/useIntentState.ts";
import type {LayeredNavigationResult} from "../../types/domain/configured.attribute.ts"
import type {MagentoLayeredNavigation} from "../../types/domain/layered-data.types.ts"

export const useLayeredNavigation = (
    categoryData: CategoryData,
    intentState: IntentEngineState,
    config: IntentDiscoveryDataConfig
): LayeredNavigationResult => {
    const { graphqlClient, bootstrap } = useSystemState()
    const initialData = bootstrap?.layeredData
    const {configuredLayeredAttributes } = useIntentState()

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

                const data = await getLayeredNavigation(
                    categoryData,
                    graphqlClient,
                    config,
                    intentState,
                    configuredLayeredAttributes
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
    }, [categoryData, intentState, graphqlClient, shouldFetch, config, configuredLayeredAttributes])

    const refetch = () => execute()

    return {
        attributeLayerData: initialData ?? data,
        attributeLayerLoading: loading,
        attributeLayerError: error,
        refetch
    }
}