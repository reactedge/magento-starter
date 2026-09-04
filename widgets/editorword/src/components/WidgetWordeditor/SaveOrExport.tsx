import {useDocumentState} from "../../state/Document/useDocumentState.ts";
import {ExportController} from "../../controller/ExportController.ts"

export const SaveOrExport = () => {
    const { file } = useDocumentState();

    const handleExport = async () => {
        const controller = new ExportController();

        await controller.toPdf(file);
    };

    return (
        <div className="word-editor__save-or-export">
            <button
                type="button"
                disabled={!file.isDirty}
            >
                Save
            </button>

            <button
                type="button"
                disabled={!file.content}
                onClick={handleExport}
            >
                Export PDF
            </button>
        </div>
    );
};