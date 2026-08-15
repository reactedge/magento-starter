import { useContext } from "react";
import type { SelectionState } from "./type.ts";
import { SelectionStateContext } from "./SelectionState.tsx";

export function useSelectionState(): SelectionState {
    const context = useContext(SelectionStateContext);

    if (!context) {
        throw new Error(
            "useSelectionState must be used within SelectionStateProvider"
        );
    }

    return context;
}