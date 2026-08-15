import type {GalleryTile} from "../../components/Types.ts";
import type {GraphqlClient} from "@reactedge/framework/graphql/graphqlClient.ts";

type MagentoGalleryImage = {
    url: string;
    label: string | null;
    position: number | null;
    disabled: boolean | null;
};

type GalleryByAttributeProduct = {
    sku: string;
    galleryByAttribute: MagentoGalleryImage[] | null;
};

export type ProductsResponse = {
    products: {
        items: GalleryByAttributeProduct[];
    };
};

const QUERY = `
  query ProductGallery($sku: String!, $code: String!, $value: String!) {
    products(filter: { sku: { eq: $sku } }) {
        items {
            sku
            ... on ConfigurableProduct {
                galleryByAttribute(
                    code: $code
                    value: $value
                ) {
                    url
                    label
                    position
                    disabled
                }
            }
        }
    }
   }
`;

export async function fetchMagentoGalleryByAttributeData(
    graphqlClient: GraphqlClient,
    sku: string,
    attributeCode: string,
    attributeValue: string
): Promise<GalleryTile[]> {
    const data = await graphqlClient<ProductsResponse>(
        QUERY,
        {
            sku,
            code: attributeCode,
            value: attributeValue
        }
    );

    const product = data.products.items[0];

    if (!product?.galleryByAttribute) {
        return [];
    }

    return product.galleryByAttribute.map((image) => ({
        src: image.url,
        ...(image.label !== null
            ? { alt: image.label }
            : {})
    }));
}