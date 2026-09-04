import type { WidgetActivity } from "@reactedge/framework/activity";
import type {DocumentFile, DocumentType} from "../state/Document/type.ts"
import type {DocumentLoadResult} from "../types/document.types.ts";
export class DocumentController {
    private readonly activity: WidgetActivity

    constructor(
        activity: WidgetActivity
    ) {
        this.activity = activity;
    }

    private async isValidDocument(
        url: string,
        type: DocumentType
    ): Promise<boolean> {
        const response = await fetch(url);

        if (!response.ok) {
            return false;
        }

        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        switch (type) {
            case "pdf":
                return (
                    bytes[0] === 0x25 && // %
                    bytes[1] === 0x50 && // P
                    bytes[2] === 0x44 && // D
                    bytes[3] === 0x46    // F
                );

            case "odt":
            case "docx":
                return (
                    bytes[0] === 0x50 && // P
                    bytes[1] === 0x4b    // K
                );
        }
    }

    private getDocumentType(filename: string): DocumentType | null {
        const extension = filename
            .split(".")
            .pop()
            ?.toLowerCase();

        if (extension === "pdf" || extension === "odt" || extension === "docx") {
            return extension;
        }

        return null;
    }

    async load(file: DocumentFile): Promise<DocumentLoadResult> {
        const filename = file.filename.trim();

        if (!filename) {
            const error = `Filename is missing: ${filename}`;

            this.activity.log(
                "Document Filename Missing",
                error,
                "error"
            );

            return {
                success: false,
                error,
            };
        }

        const type = this.getDocumentType(filename);

        if (!type) {
            const error = `Unsupported document type: ${filename}`;

            this.activity.log(
                "Document Type",
                error,
                "error"
            );

            return {
                success: false,
                error,
            };
        }

        try {
            const url = `/${encodeURIComponent(filename)}`;

            if (!await this.isValidDocument(url, type)) {
                const error = `Document not found or invalid: ${filename}`;

                this.activity.log(
                    "Document Validation",
                    error,
                    "error"
                );

                return {
                    success: false,
                    error,
                };
            }

            const fileData: DocumentFile = {
                ...file,
                filename,
                url,
                type
            };

            return {
                success: true,
                file: fileData,
            };
        } catch (error) {
            const message = error instanceof Error
                    ? error.message
                    : "Unable to load document";
            this.activity.log(
                "Error Document",
                message,
                "error"
            );

            return {
                success: false,
                error: message
            };
        }
    }
}