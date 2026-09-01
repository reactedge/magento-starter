import {useEffect, useState} from "react";
import {useSystemState} from "../../state/System/useSystemState.ts";
import {getError} from "../../lib/error.ts";
import type {AttributeResponse} from "../../types/infra/magento/attribute.types.ts";

const QUERY = `
    {
      attributesList(entityType: CATALOG_PRODUCT, filters: {is_filterable: true}) {
        errors {
          message
          type
        }
        items {
          code
          frontend_input
          label
        }
      }
    }
`;

export function useProductAttributes() {
    const [data, setData] = useState<AttributeResponse>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { graphqlClient } = useSystemState()

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await graphqlClient<AttributeResponse>(
                    QUERY, {}
                );
                setData(result);
            } catch (err: unknown) {
                setError(getError(err));
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [graphqlClient]);

    return { magentoAttributes: data?.attributesList.items, loading, error, refetch: load };
}
