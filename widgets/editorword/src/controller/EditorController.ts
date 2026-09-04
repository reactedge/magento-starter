export class EditorController {
    private readonly editor: HTMLElement
    constructor(
        editor: HTMLElement
    ) {
        this.editor = editor
    }

    focus(): void {
        this.editor.focus();
    }

    bold(): void {
        this.execute("bold");
    }

    italic(): void {
        this.execute("italic");
    }

    heading(): void {
        this.execute("formatBlock", "h2");
    }

    bulletList(): void {
        this.execute("insertUnorderedList");
    }

    undo(): void {
        this.execute("undo");
    }

    redo(): void {
        this.execute("redo");
    }

    private execute(command: string, value?: string): void {
        this.editor.focus();
        document.execCommand(command, false, value);
    }
}