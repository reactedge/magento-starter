import { useMagentoGalleryData } from "../infra/useMagentoGalleryData.tsx";
import { useMagentoGalleryByAttribute } from "../infra/useMagentoGalleryByAttribute.tsx";
import { useSelectionState } from "../../state/Selection/useSelectionState.tsx";
import type {GalleryTile} from "../../components/Types.ts";
import type {BootstrapData} from "../../entrypoints/ssr.tsx";

export function useGalleryData(
    sku: string,
    bootstrap?: BootstrapData
) {
    const { selection} = useSelectionState();
    const initialData = bootstrap?.galleryData;

    const hasSelection =
        selection.code !== null &&
        selection.value !== null;

    const shouldFetch = bootstrap === undefined;

    const {
        magentoGalleryData,
        loading: galleryLoading,
        error: galleryError,
        refetch,
    } = useMagentoGalleryData(
        shouldFetch,
        sku
    );

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

    const baseGalleryData =
        initialData ?? magentoGalleryData;

    const galleryData = mergeGalleryData(baseGalleryData, selectionLoading ? [] : selectedGalleryData);

    const ready =
        galleryData.length > 0 &&
        !galleryLoading;

    return {
        galleryData,

        galleryLoading:
            shouldFetch && galleryLoading,

        galleryUpdating:
            hasSelection && selectionLoading,

        galleryError:
            (shouldFetch ? galleryError : null) ??
            (hasSelection ? selectionError : null),

        refetch,
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