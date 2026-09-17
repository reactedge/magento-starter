import type {GalleryTile} from "./Types.ts";
import {ZoomView} from "./ProductTiledGallery/ZoomView.tsx";
import {useGallery} from "../hooks/useGallery.tsx";
import {TileGrid} from "./ProductTiledGallery/TileGrid.tsx";
import {useGalleryAvailability} from "../hooks/domain/useGalleryAvailability.tsx";

interface ProductTiledGalleryProps {
    tiles: GalleryTile[];
    maxColumns: number;
}

export const ProductTiledGallery = ({tiles, maxColumns}: ProductTiledGalleryProps) => {
    const gallery = useGallery(tiles);

    const currentImage = useGalleryAvailability(
        tiles,
        gallery.currentImage
    );

    if (!currentImage) {
        return null;
    }

    if (gallery.zoomed) {
        return (
            <ZoomView
                image={currentImage}
                activeIndex={gallery.activeIndex}
                onClose={() => gallery.setZoomed(false)}
                onPrevious={gallery.previous}
                onNext={gallery.next}
            />
        );
    }

    return (
        <TileGrid
            tiles={tiles}
            maxColumns={maxColumns}
            onSelect={(index) => {
                gallery.setActiveIndex(index);
                gallery.setZoomed(true);
            }}
        />
    );
}

