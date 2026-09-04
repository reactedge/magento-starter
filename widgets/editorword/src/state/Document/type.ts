export type DocumentType = "pdf" | "odt" | "docx";

export interface DocumentFile {
    filename: string;
    url: string | null;
    content: string,
    type: DocumentType | null,
    isDirty: boolean;
}

export interface DocumentState {
    file: DocumentFile;
    error: string | null;
}

export interface DocumentStateContext extends DocumentState {
    editor: HTMLElement | null;
    setEditor: (editor: HTMLElement | null) => void;
    setFile: (file: DocumentFile) => void;
    setError: (error: string | null) => void;
    loadContent: (content: string) => void;
    setContent: (content: string) => void;
    markSaved: () => void;
}