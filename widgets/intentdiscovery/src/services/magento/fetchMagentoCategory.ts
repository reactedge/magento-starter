import type { GraphqlClient } from "@reactedge/framework/graphql/graphqlClient.ts";
import type { CategoryData } from "../../types/infra/magento/category.types.ts";

export type CategoryResponse = {
    categories: {
        items: CategoryData[]
    }
}

const QUERY = `
  query MagentoCategories($filter: CategoryFilterInput!) {
      categories(
        filters: $filter
      ) {
        items {
          id        
          name        
          children {
            id           
          }
        }
      }
    }
`;

export async function fetchMagentoCategory(
    graphqlClient: GraphqlClient,
    urlKey: string
): Promise<CategoryData> {
    const data = await graphqlClient<CategoryResponse>(
        QUERY,
        {
            filter: {
                url_key: {
                    eq: urlKey
                }
            }
        }
    );

    const category = data.categories.items[0];

    if (!category) {
        throw new Error(`Magento category not found for url_key: ${urlKey}`);
    }

    return category;
}