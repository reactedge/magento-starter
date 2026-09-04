import type {DocumentFile} from "../../../state/Document/type.ts";

interface Props {
    file: DocumentFile;
}

export const PdfDocument = ({ file }: Props) => {
    if (!file.url) {
        return null;
    }

    return (
        <iframe
            src={file.url}
            title={file.filename}
            className="word-editor__document-frame"
        />
    );
};