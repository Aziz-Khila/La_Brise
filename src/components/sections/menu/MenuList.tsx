import type { MenuCategory } from "@/config/types";
import { MenuItemRow } from "@/components/sections/menu/MenuItemRow";

type MenuListProps = {
  menu: MenuCategory[];
  currency: string;
};

export function MenuList({ menu, currency }: MenuListProps) {
  return (
    <div className="menu-list">
      {menu.map((category) => (
        <section key={category.id} className="menu-list-category" aria-labelledby={`cat-${category.id}`}>
          <h3 id={`cat-${category.id}`}>{category.name}</h3>
          {category.description && <p className="menu-category-desc">{category.description}</p>}
          <ul className="menu-items">
            {category.items.map((item) => (
              <MenuItemRow key={item.name} item={item} currency={currency} showImage={false} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
