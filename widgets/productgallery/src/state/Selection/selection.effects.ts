import type { SelectionEvent } from "./type.ts";

export function runSelectionEffects(
    event: SelectionEvent
) {
    switch (event.type) {
        case "PRODUCT_ATTRIBUTE_CHANGED":
            window.dispatchEvent(
                new CustomEvent("reactedge:product-attribute", {
                    detail: event
                })
            );
            break;
    }
}