import {useContext} from "react";
import {LocalDocumentStateContext} from "./DocumentState.tsx";
import type {DocumentStateContext} from "./type.ts";

export function useDocumentState(): DocumentStateContext {
    const context = useContext(LocalDocumentStateContext);
    if (!context) {
        throw new Error("useDocumentState must be used within DocumentStateProvider");
    }
    return context;
}