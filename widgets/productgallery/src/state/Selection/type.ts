export type SelectionEvent = {
    type: "PRODUCT_ATTRIBUTE_CHANGED";
    code: string;
    value: string;
};

export interface SelectionState {
    code: string | null;
    value: string | null;
}