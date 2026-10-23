import type { Brand, RestaurantConfig, SectionConfig } from "@/config/types";
import { resolveTheme, themeToCss } from "@/config/themes";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsapp } from "@/components/site/FloatingWhatsapp";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Featured } from "@/components/sections/Featured";
import { Menu } from "@/components/sections/menu/Menu";
import { Quote } from "@/components/sections/Quote";
import { Reservation } from "@/components/sections/Reservation";
import { Visit } from "@/components/sections/Visit";

const sectionId = (section: SectionConfig) => section.id ?? section.type;

function renderSection(section: SectionConfig, restaurant: RestaurantConfig, brand: Brand) {
  const id = sectionId(section);
  switch (section.type) {
    case "hero":
      return <Hero key={id} section={section} brand={brand} />;
    case "about":
      return <About key={id} id={id} section={section} />;
    case "featured":
      return <Featured key={id} id={id} section={section} />;
    case "menu":
      return <Menu key={id} id={id} section={section} menu={restaurant.menu} brand={brand} />;
    case "quote":
      return <Quote key={id} id={id} section={section} />;
    case "reservation":
      return <Reservation key={id} id={id} section={section} brand={brand} />;
    case "visit":
      return <Visit key={id} id={id} section={section} brand={brand} />;
  }
}

export function RestaurantSite({ restaurant }: { restaurant: RestaurantConfig }) {
  const theme = resolveTheme(restaurant.theme);
  const sections = restaurant.sections.filter((section) => section.enabled !== false);
  const brand: Brand = {
    name: restaurant.name,
    kind: restaurant.kind,
    city: restaurant.city,
    logo: restaurant.logo,
    contact: restaurant.contact,
    location: restaurant.location,
    hours: restaurant.hours,
    currency: restaurant.currency,
  };

  const nav = sections.flatMap((section) =>
    section.navLabel ? [{ id: sectionId(section), label: section.navLabel }] : []
  );
  const first = sections[0];
  const overImage = first?.type === "hero" && first.variant !== "split";
  const floating = restaurant.floatingWhatsapp;

  const content = (
    <>
      <Header brand={brand} nav={nav} cta={restaurant.header?.cta} overImage={overImage} />
      <main id="top">{sections.map((section) => renderSection(section, restaurant, brand))}</main>
      <Footer brand={brand} note={restaurant.footer?.note} />
      {floating?.enabled && restaurant.contact.whatsapp && (
        <FloatingWhatsapp number={restaurant.contact.whatsapp} message={floating.message} />
      )}
    </>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeToCss(restaurant.theme) }} />
      {theme.texture && <div className="noise" aria-hidden="true" />}
      <div className="site" data-motion={restaurant.motion} data-scheme={theme.scheme}>
        {restaurant.motion === "rich" ? <SmoothScroll>{content}</SmoothScroll> : content}
      </div>
    </>
  );
}
