import Image from "next/image";
import { usableSrc } from "@/lib/images";
import type { MenuItem, MenuTag } from "@/config/types";
import { formatPrice } from "@/lib/links";

export const tagLabels: Record<MenuTag, string> = {
  new: "Nouveau",
  popular: "Populaire",
  spicy: "Épicé",
  vegetarian: "Végétarien",
  chef: "Choix du chef",
};

type MenuItemRowProps = {
  item: MenuItem;
  currency: string;
  showImage?: boolean;
};

export function MenuItemRow({ item, currency, showImage = true }: MenuItemRowProps) {
  const image = showImage ? item.image : undefined;

  return (
    <li className={`menu-item${image ? " has-image" : ""}`}>
      {usableSrc(image) && (
        <span className="menu-item-thumb">
          <Image src={image} alt="" fill sizes="72px" />
        </span>
      )}
      <div className="menu-item-body">
        <div className="menu-item-head">
          <h4>{item.name}</h4>
          <span className="menu-item-leader" aria-hidden="true" />
          <span className="menu-item-price">{formatPrice(item.price, currency)}</span>
        </div>
        {item.description && <p className="menu-item-desc">{item.description}</p>}
        {item.tags && item.tags.length > 0 && (
          <ul className="menu-item-tags">
            {item.tags.map((tag) => (
              <li key={tag} className={`menu-tag menu-tag--${tag}`}>
                {tagLabels[tag]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
