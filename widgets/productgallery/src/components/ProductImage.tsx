import type {GalleryTile} from "./Types.ts";

interface ProductImageProps {
    image: GalleryTile;
}

/**
 * This is the main image in the use case the gallery has only 1 image
 *
 * @param image
 * @constructor
 */
export const ProductImage = ({ image }: ProductImageProps) => (
    <img
        src={image.src}
        alt={image.alt ?? ""}
        className="product-gallery__image"
        data-gallery-main
        data-gallery-thumb
    />
);