import { useEffect } from "react";
import type {GalleryTile} from "../../components/Types.ts";
import {useActivityContext} from "../../activity/Context/useActivityContext.ts";

export function useGalleryAvailability(
    tiles: GalleryTile[],
    currentImage: GalleryTile | undefined
): GalleryTile | undefined {
    const activity = useActivityContext();

    const available =
        tiles.length > 0 &&
        currentImage !== undefined;

    useEffect(() => {
        if (available) {
            return;
        }

        activity?.log(
            "gallery-render",
            "Gallery cannot be rendered",
            {
                tilesNumber: tiles.length,
                hasCurrentImage: currentImage !== undefined,
            }
        );
    }, [
        available,
        tiles.length,
        currentImage,
        activity,
    ]);

    return available ? currentImage : undefined;
}