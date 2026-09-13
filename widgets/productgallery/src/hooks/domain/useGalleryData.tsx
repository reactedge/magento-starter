import { useMagentoGalleryByAttribute } from "../infra/useMagentoGalleryByAttribute.tsx";
import { useSelectionState } from "../../state/Selection/useSelectionState.tsx";
import type {GalleryTile} from "../../components/Types.ts";

export function useGalleryData(
    sku: string,
    bootstrap: GalleryTile[]
) {
    const { selection } = useSelectionState();

    const hasSelection =
        selection.code !== null &&
        selection.value !== null;

    const {
        magentoGalleryData: selectedGalleryData,
        loading: selectionLoading,
        error: selectionError,
    } = useMagentoGalleryByAttribute(
        hasSelection,
        sku,
        selection.code,
        selection.value
    );

    const galleryData = mergeGalleryData(
        bootstrap,
        selectionLoading ? [] : selectedGalleryData
    );

    const ready =
        galleryData.length > 0;

    return {
        galleryData,

        galleryLoading: false,

        galleryUpdating:
            hasSelection && selectionLoading,

        galleryError:
            hasSelection ? selectionError : null,

        ready
    };
}

function mergeGalleryData(
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