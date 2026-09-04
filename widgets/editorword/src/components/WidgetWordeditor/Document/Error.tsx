type Props = {
    error: string
};
export const Error = ({ error }: Props) => {
    return (
        <div className="word-editor__document word-editor__document--error">
            <div className="word-editor__error-state">
                <div className="word-editor__error-icon">!</div>

                <div className="word-editor__error-title">
                    Unable to load document
                </div>

                <div className="word-editor__error-description">
                    {error}
                </div>
            </div>
        </div>
    );
}