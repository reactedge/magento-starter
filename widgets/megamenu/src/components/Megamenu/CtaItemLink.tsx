import {renderIcon} from "./Icon.tsx";

interface CtaLinkProps {
    url: string;
    label: string;
    icon?: "arrow" | "external" | undefined;
}

export function CtaItemLink({ url, label, icon }: CtaLinkProps) {
    return (
        <a
            href={url}
            className="cta-link"
        >
            <span className="cta-link__label">{label}</span>

            {icon && (
                <span
                    className="cta-link__icon"
                    aria-hidden="true"
                >
                    {icon && renderIcon(icon)}
                </span>
            )}
        </a>
    );
}