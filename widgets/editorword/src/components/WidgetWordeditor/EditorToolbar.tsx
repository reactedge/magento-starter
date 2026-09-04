import {EditorController} from "../../controller/EditorController.ts"
import {useDocumentState} from "../../state/Document/useDocumentState.ts";

export const EditorToolbar = () => {
    const {
        editor
    } = useDocumentState();

    if (!editor) {
        return null;
    }

    const controller = new EditorController(editor);

    return (
        <div
            className="word-editor__toolbar"
            role="toolbar"
            aria-label="Document formatting"
        >
            <button
                type="button"
                onClick={() => controller.bold()}
                aria-label="Bold"
            >
                <strong>B</strong>
            </button>

            <button
                type="button"
                onClick={() => controller.italic()}
                aria-label="Italic"
            >
                <em>I</em>
            </button>

            <button
                type="button"
                onClick={() => controller.heading()}
            >
                Heading
            </button>

            <button
                type="button"
                onClick={() => controller.bulletList()}
            >
                List
            </button>
        </div>
    );
};
