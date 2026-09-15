import { useCallback, useEffect, useState } from "react";
import { useSystemState } from "../../state/System/useSystemState.ts";
import type { GalleryTile } from "../../components/Types.ts";
import { getError } from "../../lib/error.ts";
import { fetchMagentoGalleryByAttributeData } from "../../services/magento/fetchMagentoGalleryByAttributeData.tsx";
import {useSelectionState} from "../../state/Selection/useSelectionState.tsx";

export function useMagentoGalleryByAttribute(enabled: boolean, sku: string, attributeCode: string | null, attributeValue: string | null) {
    const [error, setError] = useState<Error | null>(null);
    const { selectionImage, setSelectionImage, setSelectionLoading } = useSelectionState();

    const { graphqlClient } = useSystemState();

    const load = useCallback(async () => {
        if (!enabled || sku === undefined || attributeCode === null || attributeValue === null) {
            return;
        }

        setSelectionLoading(true);
        setError(null);

        try {
            const result = await fetchMagentoGalleryByAttributeData(graphqlClient, sku, attributeCode, attributeValue);
            if (result.length > 0) {
                setSelectionImage(result[0] as GalleryTile);
            }
        } catch (err: unknown) {
            setError(getError(err));
        } finally {
            setSelectionLoading(false);
        }
    }, [
        enabled,
        sku,
        graphqlClient,
        attributeCode,
        attributeValue,
        setSelectionImage,
        setSelectionLoading
    ]);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        selectionImage,
        error,
        refetch: load
    };
}
