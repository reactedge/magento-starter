import {MenuItem} from "../MenuItem.tsx";
import type {NavItem} from "../../domain/megamenu.types.ts";

interface MenuProps {
    label: string;
    children?: NavItem[];
}

export function MenuLevelTwo({label, children}: MenuProps) {
    if (!children?.length) return null;

    return (
        <div className="megamenu-col">
            <div className="megamenu-col__title">
                {label}
            </div>

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
    )
}