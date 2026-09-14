import { useMagentoGalleryByAttribute } from "../infra/useMagentoGalleryByAttribute.tsx";
import { useSelectionState } from "../../state/Selection/useSelectionState.tsx";

export function useGalleryData(
    sku: string
) {
    const { selection } = useSelectionState();

    const hasSelection =
        selection.code !== null &&
        selection.value !== null;

    const {
        magentoGalleryData,
        loading: selectionLoading,
        error: selectionError,
    } = useMagentoGalleryByAttribute(
        hasSelection,
        sku,
        selection.code,
        selection.value
    );

    return {
        galleryData: magentoGalleryData ?? [],
        galleryUpdating:
            hasSelection && selectionLoading,
        galleryError:
            hasSelection ? selectionError : null
    };
}

