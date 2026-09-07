import { createContext } from "react";
import type {SelectionState, SelectionStateContext} from "./type.ts";

export const initialState: SelectionState = {
    code: null,
    value: null,
};

export const LocalDocumentStateContext =
    createContext<SelectionStateContext | undefined>(undefined);