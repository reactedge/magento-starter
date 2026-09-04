import type { DocumentFile } from "../state/Document/type";

export class ExportController {
    async toPdf(file: DocumentFile): Promise<void> {
        if (!file.content) {
            return;
        }

        const html2pdf = (await import("html2pdf.js")).default;

        const container = document.createElement("div");

        container.innerHTML = file.content;
        container.className = "word-editor__pdf-export";

        const filename = file.filename.replace(/\.docx$/i, ".pdf");

        await html2pdf()
            .from(container)
            .set({
                filename,
                margin: 15,
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait",
                },
            })
            .save();
    }
}