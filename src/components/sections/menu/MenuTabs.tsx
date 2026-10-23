"use client";

import { useState } from "react";
import type { MenuCategory } from "@/config/types";
import { MenuItemRow } from "@/components/sections/menu/MenuItemRow";

type MenuTabsProps = {
  menu: MenuCategory[];
  currency: string;
};

export function MenuTabs({ menu, currency }: MenuTabsProps) {
  const [activeId, setActiveId] = useState(menu[0]?.id);
  const active = menu.find((category) => category.id === activeId) ?? menu[0];
  if (!active) return null;

  return (
    <div className="menu-tabs">
      <div className="menu-tablist" role="tablist" aria-label="Catégories du menu" data-lenis-prevent>
        {menu.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            id={`tab-${category.id}`}
            aria-selected={category.id === active.id}
            aria-controls={`panel-${category.id}`}
            className="menu-tab"
            onClick={() => setActiveId(category.id)}
          >
            {category.name}
            <span className="menu-tab-count">{category.items.length}</span>
          </button>
        ))}
      </div>

      <div
        key={active.id}
        className="menu-panel"
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
      >
        {active.description && <p className="menu-category-desc">{active.description}</p>}
        <ul className="menu-items menu-items--grid">
          {active.items.map((item) => (
            <MenuItemRow key={item.name} item={item} currency={currency} />
          ))}
        </ul>
      </div>
    </div>
  );
}
