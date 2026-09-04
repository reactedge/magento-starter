import type {DocumentFile} from "../state/Document/type.ts"

export type DocumentLoadResult =
    | {
    success: true;
    file: DocumentFile;
}
    | {
    success: false;
    error: string;
};