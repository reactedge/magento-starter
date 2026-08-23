import {MenuItem} from "../MenuItem.tsx";
import type {NavItem} from "../../domain/megamenu.types.ts";

interface MenuProps {
    children?: NavItem[];
}

export function MenuSimpleList({ children }: MenuProps) {
    if (!children?.length) return null;

    return (
        <div className="megamenu-col">
            <ul className="megamenu-col__list">
                {children.map(level3 => (
                    <li
                        key={level3.id}
                        className="megamenu-col__item"
                    >
                        <MenuItem item={level3}/>
                    </li>
                ))}
            </ul>
        </div>
    );
}
