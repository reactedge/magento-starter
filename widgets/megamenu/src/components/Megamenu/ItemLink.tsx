
interface ItemLinkProps {
    url: string;
    label: string;
    isInBreadcrumb?: boolean;
}

export const ItemLink = ({ url, label, isInBreadcrumb }: ItemLinkProps) => {
    return (
        <a
            href={url}
            className={`link${isInBreadcrumb ? " in-breadcrumb" : ""}`}
        >
            {label}
        </a>
    );
};

