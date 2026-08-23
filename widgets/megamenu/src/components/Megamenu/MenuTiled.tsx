import {MenuItem} from "../MenuItem.tsx";
import type {NavItem} from "../../domain/megamenu.types.ts";

interface MenuProps {
    children?: NavItem[];
}

export function MenuTiled({ children }: MenuProps) {
    if (!children?.length) return null;

    return (
        <div className="megamenu-col">
            <ul className="megamenu-col__list">
                {children.map(level2 => (
                    <li
                        key={level2.id}
                        className="megamenu-col__item"
                    >
                        {/*<MenuTile key={level2.id} item={level2}/>*/}
                        <MenuItem item={level2}/>
                    </li>
                ))}
            </ul>
        </div>
    );
}
