import { useEffect, useState, useCallback } from "react";
import { useSystemState } from "../../state/System/useSystemState.ts";
import { getError } from "../../lib/error.ts";
import { useOptionSelectionFilter } from "../domain/useOptionSelectionFilter.tsx";
import type { CategoryData } from "../../types/infra/magento/category.types.ts";
import type { ProductAttributesResponse } from "../../types/domain/layered-data.types.ts"

const QUERY = `
     query MagentoProducts($filter: ProductAttributeFilterInput!) {
      products(filter: $filter) {
        total_count
        aggregations{
          attribute_code
          label
          count
          options{
            count
            label
            value
          }
        }
      }
    }
`;

export const useProductFilteredAttributeLayer = (categoryData: CategoryData) => {
    const [data, setData] = useState<ProductAttributesResponse>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { graphqlClient } = useSystemState()

    const filter = useOptionSelectionFilter(categoryData)

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await graphqlClient<ProductAttributesResponse>(
                QUERY,
                { filter }
            );

            setData(result);
        } catch (err: unknown) {
            setError(getError(err));
        } finally {
            setLoading(false);
        }
    }, [
        graphqlClient,
        filter
    ]);

    useEffect(() => {
        if (!filter) return;

        void load();
    }, [filter, graphqlClient, load]);

    return {
        magentoAttributesLayer: data?.products,
        loading,
        error,
        refetch: load
    };
}
