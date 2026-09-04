export type DocumentBlockType =
    | "heading"
    | "paragraph"
    | "image";

export interface DocumentBlock {
    type: DocumentBlockType;
    label: string;
}

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