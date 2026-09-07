import { useContext } from "react";
import type {SelectionStateContext} from "./type.ts";
import {LocalDocumentStateContext} from "./SelectionState.tsx";

export function useSelectionState(): SelectionStateContext {
    const context = useContext(LocalDocumentStateContext);

    if (!context) {
        throw new Error(
            "useSelectionState must be used within SelectionStateProvider"
        );
    }

    return context;
}