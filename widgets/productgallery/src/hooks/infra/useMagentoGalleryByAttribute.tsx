import { useCallback, useEffect, useState } from "react";
import { useSystemState } from "../../state/System/useSystemState.ts";
import type { GalleryTile } from "../../components/Types.ts";
import { getError } from "../../lib/error.ts";
import { fetchMagentoGalleryByAttributeData } from "../../services/magento/fetchMagentoGalleryByAttributeData.tsx";

export function useMagentoGalleryByAttribute(enabled: boolean, sku: string, attributeCode: string | null, attributeValue: string | null) {
    const [data, setData] = useState<GalleryTile[]>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { graphqlClient } = useSystemState();

    const load = useCallback(async () => {
        if (!enabled || sku === undefined || attributeCode === null || attributeValue === null) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetchMagentoGalleryByAttributeData(graphqlClient, sku, attributeCode, attributeValue);
            setData(result);
        } catch (err: unknown) {
            setError(getError(err));
        } finally {
            setLoading(false);
        }
    }, [enabled, sku, graphqlClient,  attributeCode, attributeValue]);

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