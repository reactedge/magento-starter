import type {DocumentBlock} from "../../../../types/block.types.ts"

export const documentBlocks: DocumentBlock[] = [
    {
        type: "heading",
        label: "Heading",
    },
    {
        type: "paragraph",
        label: "Paragraph",
    },
    {
        type: "image",
        label: "Image",
    },
];

export const BlockPalette = () => {
    const handleDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        type: string,
    ) => {
        event.dataTransfer.setData(
            "application/reactedge-document-block",
            type,
        );

        event.dataTransfer.effectAllowed = "copy";
    };

    return (
        <aside className="word-editor__block-palette">
            <div className="word-editor__block-palette-title">
                Blocks
            </div>

            {documentBlocks.map(block => (
                <div
                    key={block.type}
                    className="word-editor__block"
                    draggable
                    onDragStart={event =>
                        handleDragStart(event, block.type)
                    }
                >
                    {block.label}
                </div>
            ))}
        </aside>
    );
};