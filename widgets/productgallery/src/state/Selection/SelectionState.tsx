import { createContext } from "react";
import type { SelectionState } from "./type.ts";

export const initialState: SelectionState = {
    code: null,
    value: null,
};

export const SelectionStateContext =
    createContext<SelectionState | undefined>(undefined);