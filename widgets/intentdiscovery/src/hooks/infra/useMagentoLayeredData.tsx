export const LAYERED_ATTRIBUTE_DATA = `
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
            swatch_data {
                value
                type
            }
          }
        }
      }
    }
`;