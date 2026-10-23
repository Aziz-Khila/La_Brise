"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usableSrc } from "@/lib/images";
import type { Brand, Cta } from "@/config/types";
import { CtaButton } from "@/components/ui/CtaButton";
import { MenuIcon } from "@/components/ui/Icons";

type HeaderProps = {
  brand: Brand;
  nav: { id: string; label: string }[];
  cta?: Cta;
  /** The page starts with a full-bleed photo, so the header text stays light until scrolled. */
  overImage: boolean;
};

export function Header({ brand, nav, cta, overImage }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const classes = [
    "site-header",
    scrolled || open ? "is-scrolled" : "",
    overImage ? "is-over-image" : "",
    open ? "is-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const close = () => setOpen(false);

  return (
    <header className={classes}>
      <a className="logo" href="#top" aria-label={`${brand.name} accueil`} onClick={close}>
        {usableSrc(brand.logo) && (
          <span className="logo-mark">
            <Image src={brand.logo} alt="" fill sizes="48px" priority />
          </span>
        )}
        <span className="logo-copy">
          <span className="logo-text">{brand.name}</span>
          <span className="logo-sub">{brand.kind}</span>
        </span>
      </a>

      <nav className="nav" aria-label="Navigation principale">
        {nav.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        {cta && (
          <CtaButton cta={cta} brand={brand} className="header-cta" />
        )}
        {nav.length > 0 && (
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon open={open} />
          </button>
        )}
      </div>

      <div id="mobile-nav" className="mobile-nav" hidden={!open}>
        {nav.map((item) => (
          <a key={item.id} href={`#${item.id}`} onClick={close}>
            {item.label}
          </a>
        ))}
        {cta && (
          <CtaButton cta={cta} brand={brand} onClick={close} className="mobile-nav-cta" />
        )}
      </div>
    </header>
  );
}
