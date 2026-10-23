import Image from "next/image";
import { usableSrc } from "@/lib/images";
import type { Brand } from "@/config/types";
import { instagramHref, telHref, whatsappHref } from "@/lib/links";

type FooterProps = {
  brand: Brand;
  note?: string;
};

export function Footer({ brand, note }: FooterProps) {
  const { contact } = brand;
  const links = [
    contact.instagram && { label: "Instagram", href: instagramHref(contact.instagram) },
    contact.facebook && { label: "Facebook", href: contact.facebook },
    contact.tiktok && { label: "TikTok", href: contact.tiktok },
    contact.whatsapp && { label: "WhatsApp", href: whatsappHref(contact.whatsapp) },
    contact.phone && { label: contact.phone, href: telHref(contact.phone) },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        {usableSrc(brand.logo) && (
          <span className="footer-logo">
            <Image src={brand.logo} alt="" fill sizes="40px" />
          </span>
        )}
        <div className="footer-brand-copy">
          <p>{brand.name}</p>
          <span>
            {brand.kind} · {brand.city}
          </span>
        </div>
      </div>

      {links.length > 0 && (
        <nav className="footer-links" aria-label="Réseaux et contact">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}

      <p className="footer-note">
        © {new Date().getFullYear()} {brand.name}
        {note ? ` · ${note}` : ""}
      </p>
    </footer>
  );
}
