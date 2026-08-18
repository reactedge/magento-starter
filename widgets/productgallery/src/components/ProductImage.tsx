import type {GalleryTile} from "./Types.ts";

interface ProductImageProps {
    image: GalleryTile;
}

export const ProductImage = ({ image }: ProductImageProps) => (
    <img
        src={image.src}
        alt={image.alt ?? ""}
        className="product-gallery__image"
        data-gallery-main
        data-gallery-thumb
    />
);