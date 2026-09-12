import {isInBreadCrumb} from "../lib/url.ts";
import type {NavItem} from "../domain/megamenu.types.ts";

interface ParentMenuItemProps {
    isActive: boolean;
    item: NavItem;
    hasSubmenu: boolean
}

export function ParentMenuItem({
    item,
    isActive,
    hasSubmenu
}: ParentMenuItemProps) {
    const isBreadcrumb = isInBreadCrumb(item);

    const label = (
        <span
            className={[
                "parent-label",
                isActive && "is-active",
                isBreadcrumb && "is-breadcrumb",
                hasSubmenu && "has-submenu"
            ]
                .filter(Boolean)
                .join(" ")
            }
        >
            {item.label}
            {hasSubmenu && (
                <span className="parent-arrow" aria-hidden="true">
                    ▼
                </span>
            )}
        </span>
    );

    if (!hasSubmenu && item.url) {
        return (
            <a
                href={item.url}
                className="parent-link"
            >
                {label}
            </a>
        );
    }

    return <div className="parent-item">{label}</div>;
}