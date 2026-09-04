import {createContext} from "react";
import type {DocumentStateContext} from "./type.ts";

export const LocalDocumentStateContext = createContext<DocumentStateContext | undefined>(undefined);