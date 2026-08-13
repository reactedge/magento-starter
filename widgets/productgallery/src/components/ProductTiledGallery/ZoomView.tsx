import type { GalleryTile } from "../Types.ts";

interface ZoomViewProps {
    image: GalleryTile;
    activeIndex: number;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

export const ZoomView = ({
         image,
         activeIndex,
         onClose,
         onPrevious,
         onNext
     }: ZoomViewProps) => {
    return (
        <div
            className="product-gallery__zoom"
            data-gallery-zoom
        >
            <button
                type="button"
                className="product-gallery__zoom-minify"
                onClick={onClose}
                aria-label="Close zoom view"
                data-gallery-minify
            >
                Minify ✕
            </button>

            <button
                type="button"
                className="product-gallery__zoom-arrow product-gallery__zoom-arrow--previous"
                onClick={onPrevious}
                aria-label="Previous image"
                data-gallery-prev
            >
                ‹
            </button>

            <button
                type="button"
                className="product-gallery__zoom-arrow product-gallery__zoom-arrow--next"
                onClick={onNext}
                aria-label="Next image"
                data-gallery-next
            >
                ›
            </button>

            <img
                key={activeIndex}
                src={image.src}
                alt={image.alt}
                className="product-gallery__zoom-image"
                data-gallery-main
            />
        </div>
    );
};