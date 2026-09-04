import {useDocumentState} from "../../state/Document/useDocumentState.ts";
import {PdfDocument} from "./Document/PdfDocument.tsx"
import {OdtDocument} from "./Document/OdtDocument.tsx"
import {DocxDocument} from "./Document/DocxDocument.tsx"
import {Error} from "./Document/Error.tsx";
export const Document = () => {
    const { file, error } = useDocumentState();

    if (error) {
        return <Error error={error} />
    }

    if (!file.url) {
        return (
            <div className="word-editor__document word-editor__document--empty">
                <div className="word-editor__empty-state">
                    <div className="word-editor__empty-icon">＋</div>

                    <div className="word-editor__empty-title">
                        No document loaded
                    </div>

                    <div className="word-editor__empty-description">
                        Load a document or create a new one to start editing.
                    </div>
                </div>
            </div>
        );
    }

    let document;

    switch (file.type) {
        case "pdf":
            document = <PdfDocument file={file}/>;
            break;

        case "docx":
            document = <DocxDocument url={file.url}/>;
            break;

        case "odt":
            document = <OdtDocument url={file.url}/>;
            break;

        default:
            document = null;
    }

    return (
        <div className="word-editor__document">
            {document}
        </div>
    );
};