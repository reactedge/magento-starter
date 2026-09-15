import { useMagentoGalleryByAttribute } from "../infra/useMagentoGalleryByAttribute.tsx";
import { useSelectionState } from "../../state/Selection/useSelectionState.tsx";

export function useMagentoSelectionGallery(sku: string) {
    const { selection } = useSelectionState();

    const hasSelection =
        selection.code !== null &&
        selection.value !== null;

    useMagentoGalleryByAttribute(
        hasSelection,
        sku,
        selection.code,
        selection.value
    );
}

