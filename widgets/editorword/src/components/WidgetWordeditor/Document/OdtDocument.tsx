import { useEffect, useState } from "react";
import * as mammoth from "mammoth";

interface Props {
    url: string;
}

export const OdtDocument = ({ url }: Props) => {
    const [html, setHtml] = useState("");

    useEffect(() => {
        const load = async () => {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();

            const result = await mammoth.convertToHtml({
                arrayBuffer,
            });

            setHtml(result.value);
        };

        void load();
    }, [url]);

    return (
        <div
            className="word-editor__document-content"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};