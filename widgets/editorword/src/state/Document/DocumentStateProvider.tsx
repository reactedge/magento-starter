import React from "react";
import {type ReactNode, useState, useCallback} from "react";
import {LocalDocumentStateContext} from "./DocumentState.tsx";
import type {DocumentFile, DocumentState} from "./type.ts"

interface DocumentStateProviderProps {
    children: ReactNode
}

const LocalStateProvider = LocalDocumentStateContext.Provider;

export const initialDocumentState: DocumentFile = {
    filename: "",
    content: "",
    url: null,
    type: null,
    isDirty: false
}

export const DocumentStateProvider: React.FC<DocumentStateProviderProps> = ({
    children
}) => {
    const [state, setState] = useState<DocumentState>({
        file: initialDocumentState,
        error: null,
    });
    const [editor, setEditor] = useState<HTMLElement | null>(null);

    const loadContent = useCallback((content: string) => {
        setState(current => ({
            ...current,
            file: {
                ...current.file,
                content,
                isDirty: false,
            },
        }));
    }, []);

    const setContent = useCallback((content: string) => {
        setState(current => ({
            ...current,
            file: {
                ...current.file,
                content,
                isDirty: true,
            },
        }));
    }, []);

    const markSaved = () => {
        setState(current => ({
            ...current,
            file: {
                ...current.file,
                isDirty: false,
            },
        }));
    };

    const setFile = (file: DocumentFile) => {
        setState(current => ({
            ...current,
            file: {
                ...file,
                isDirty: false,
            },
            error: null,
        }));
    }

    const setError = useCallback((error: string | null) => {
        setState(current => ({
            ...current,
            error,
        }));
    }, []);

    return (
        <LocalStateProvider
            value={{
                file: state.file,
                error: state.error,
                editor,
                setFile,
                setError,
                setEditor,
                loadContent,
                setContent,
                markSaved,
            }}
        >
            {children}
        </LocalStateProvider>
    );
};