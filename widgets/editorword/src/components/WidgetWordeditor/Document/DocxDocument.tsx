import { useEffect } from "react";
import * as mammoth from "mammoth";
import {useDocumentState} from "../../../state/Document/useDocumentState.ts";

interface Props {
    url: string;
}

export const DocxDocument = ({ url }: Props) => {
    const {
        file,
        editor,
        setEditor,
        loadContent,
        setContent,
    } = useDocumentState();

    const createBlockHtml = (type: string): string => {
        switch (type) {
            case "heading":
                return "<h2>New heading</h2>";

            case "paragraph":
                return "<p>New paragraph</p>";

            case "image":
                return "<p>[Image]</p>";

            default:
                return "";
        }
    };

    useEffect(() => {
        const load = async () => {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();

            const result = await mammoth.convertToHtml({
                arrayBuffer,
            });

            loadContent(result.value);
        };

        void load();
    }, [url, loadContent]);

    const handleDragOver = (
        event: React.DragEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (
        event: React.DragEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();

        const type = event.dataTransfer.getData(
            "application/reactedge-document-block",
        );

        if (!type || !editor) {
            return;
        }

        const html = createBlockHtml(type);

        const range = document.caretRangeFromPoint(
            event.clientX,
            event.clientY,
        );

        if (!range || !editor.contains(range.startContainer)) {
            editor.insertAdjacentHTML("beforeend", html);
        } else {
            const fragment = range.createContextualFragment(html);

            range.deleteContents();
            range.insertNode(fragment);
        }

        setContent(editor.innerHTML);
        editor.focus();
    };

    const handleInput = (
        event: React.FormEvent<HTMLDivElement>
    ) => {
        setContent(event.currentTarget.innerHTML);
    };

    return (
        <div
            ref={setEditor}
            className="word-editor__document-content"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            dangerouslySetInnerHTML={{ __html: file.content }}
        />
    );
};