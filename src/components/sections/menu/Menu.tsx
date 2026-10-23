import type { Brand, MenuCategory, MenuSection } from "@/config/types";
import { Reveal } from "@/components/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { WhatsappIcon } from "@/components/ui/Icons";
import { MenuBook } from "@/components/sections/menu/MenuBook";
import { MenuList } from "@/components/sections/menu/MenuList";
import { MenuTabs } from "@/components/sections/menu/MenuTabs";
import { whatsappHref } from "@/lib/links";

type MenuProps = {
  section: MenuSection;
  id: string;
  menu: MenuCategory[];
  brand: Brand;
};

export function Menu({ section, id, menu, brand }: MenuProps) {
  const whatsapp = brand.contact.whatsapp;

  return (
    <section id={id} className={`section menu menu--${section.variant}`}>
      <div className="section-inner">
        <SectionIntro eyebrow={section.eyebrow} title={section.title} text={section.text} />

        {section.variant === "book" && (
          <MenuBook menu={menu} brand={brand} coverNote={section.coverNote} />
        )}
        {section.variant === "tabs" && (
          <Reveal delay={100}>
            <MenuTabs menu={menu} currency={brand.currency} />
          </Reveal>
        )}
        {section.variant === "list" && (
          <Reveal delay={100}>
            <MenuList menu={menu} currency={brand.currency} />
          </Reveal>
        )}

        {section.orderButton && whatsapp && (
          <Reveal className="menu-order">
            <a
              className="btn btn-primary btn-icon"
              href={whatsappHref(whatsapp, `Bonjour ${brand.name}, je souhaite passer une commande :`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappIcon />
              Commander sur WhatsApp
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
