import type {NavItem} from "../../domain/megamenu.types.ts";

type MenuTileProps = {
    item: NavItem;
};

export function MenuTile({ item }: MenuTileProps) {
    return (
        <a
            href={item.url}
            className="menu-tile"
        >
            {item.image && (
                <img
                    src={item.image}
                    alt={item.label}
                    className="menu-tile__image"
                />
            )}

            <span className="menu-tile__label">
                {item.label}
            </span>
        </a>
    );
}
