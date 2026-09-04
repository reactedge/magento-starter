import {useDocumentState} from "../../state/Document/useDocumentState.ts";
import {useActivityContext} from "../../activity/Context/useActivityContext.ts";
import {DocumentController} from "../../controller/DocumentController.ts"

export const Toolbar = () => {
    const activity = useActivityContext()
    const { file, setFile, setError } = useDocumentState();

    const handleFilenameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFile({
            ...file,
            filename: event.target.value,
        });
    };
    const handleLoad = async () => {
        setError(null);

        const controller = new DocumentController(activity);
        const result = await controller.load(file);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setFile(result.file);
    };

    return (
        <div className="word-editor__toolbar">
            <input
                type="text"
                value={file.filename}
                onChange={handleFilenameChange}
                placeholder="Document filename"
                aria-label="Document filename"
            />

            <button
                type="button"
                onClick={handleLoad}
                disabled={!file.filename.trim()}
            >
                Load
            </button>
        </div>
    );
};