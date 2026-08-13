import type {GalleryTile} from "./Types.ts";
import {useGallery} from "../hooks/useGallery.tsx";

interface ProductGalleryProps {
    tiles: GalleryTile[]
}

export const ProductGallery = ({ tiles }: ProductGalleryProps) => {
    const gallery = useGallery(tiles);

    if (tiles.length === 0 || gallery.currentImage === undefined) {
        return null;
    }

    return (
        <div
            className="product-gallery__slider"
            data-gallery-classic
        >
            <button
                type="button"
                className="product-gallery__slider-arrow product-gallery__slider-arrow--previous"
                onClick={gallery.previous}
                aria-label="Previous image"
                data-gallery-prev
            >
                ‹
            </button>

            <button
                type="button"
                className="product-gallery__slider-arrow product-gallery__slider-arrow--next"
                onClick={gallery.next}
                aria-label="Next image"
                data-gallery-next
            >
                ›
            </button>

            <img
                key={gallery.activeIndex}
                src={gallery.currentImage.src}
                alt={gallery.currentImage.alt}
                className="product-gallery__slider-main-image"
                data-gallery-main
            />

            <div className="product-gallery__slider-thumbnails">
                {tiles.map((tile, index) => (
                    <button
                        key={index}
                        type="button"
                        className={[
                            "product-gallery__slider-thumbnail",
                            index === gallery.activeIndex
                                ? "product-gallery__slider-thumbnail--active"
                                : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => gallery.select(index)}
                        aria-label={`View image ${index + 1}`}
                        aria-current={
                            index === gallery.activeIndex
                                ? "true"
                                : undefined
                        }
                    >
                        <img
                            src={tile.src}
                            alt={tile.alt}
                            data-gallery-thumb
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};