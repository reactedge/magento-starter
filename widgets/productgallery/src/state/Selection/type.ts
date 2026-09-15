import type {GalleryTile} from "../../components/Types.ts";

export type SelectionEvent = {
    type: "PRODUCT_ATTRIBUTE_CHANGED";
    code: string;
    value: string;
};

export interface SelectionState {
    code: string | null;
    value: string | null;
}

export interface SelectionStateContext {
    selection: SelectionState,
    selectionLoading: boolean,
    setSelectionLoading: (loading: boolean) => void;
    selectionImage?: GalleryTile | undefined;
    setSelectionImage: (image: GalleryTile) => void;
}