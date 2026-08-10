import { useCallback, useEffect, useState } from "react";
import { useSystemState } from "../../state/System/useSystemState.ts";
import type { GalleryTile } from "../../components/Types.ts";
import { getError } from "../../lib/error.ts";
import { fetchMagentoGalleryData } from "../../services/magento/fetchMagentoGalleryData.tsx";

export function useMagentoGalleryData(enabled: boolean, sku?: string) {
    const [data, setData] = useState<GalleryTile[]>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { graphqlClient } = useSystemState();

    const load = useCallback(async () => {
        if (!enabled || sku === undefined) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetchMagentoGalleryData(graphqlClient, sku);
            setData(result);
        } catch (err: unknown) {
            setError(getError(err));
        } finally {
            setLoading(false);
        }
    }, [enabled, sku, graphqlClient]);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        magentoGalleryData: data,
        loading,
        error,
        refetch: load
    };
}