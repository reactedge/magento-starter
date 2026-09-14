import type {GalleryTile} from "../components/Types.ts";

export function mergeGalleryData(
    base: GalleryTile[] = [],
    selected: GalleryTile[] = []
): GalleryTile[] {
    const images = new Map(
        base.map(image => [image.src, image])
    );

    for (const image of selected) {
        images.set(image.src, image);
    }

    return [...images.values()];
}