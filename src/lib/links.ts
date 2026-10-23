import type { CtaAction, RestaurantConfig } from "@/config/types";

const digits = (value: string) => value.replace(/[^\d]/g, "");

export function telHref(phone: string): string {
  return `tel:+${digits(phone)}`;
}

export function whatsappHref(number: string, message?: string): string {
  const base = `https://wa.me/${digits(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function instagramHref(handle: string): string {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}

export function mapEmbedSrc(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function formatPrice(price: number | string, currency: string): string {
  if (typeof price === "string") return price;
  const amount = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 3,
  }).format(price);
  return `${amount} ${currency}`;
}

type ResolvedCta = {
  href: string;
  external: boolean;
};

/** Turns a configured button action into a link; returns null when the restaurant lacks the needed contact. */
export function resolveCta(
  action: CtaAction,
  restaurant: Pick<RestaurantConfig, "contact" | "location" | "name">
): ResolvedCta | null {
  const { contact, location } = restaurant;
  switch (action) {
    case "tour":
      return { href: "#", external: false };
    case "whatsapp":
      return contact.whatsapp
        ? {
            href: whatsappHref(
              contact.whatsapp,
              `Bonjour ${restaurant.name}, je souhaite passer une commande.`
            ),
            external: true,
          }
        : null;
    case "call":
      return contact.phone ? { href: telHref(contact.phone), external: false } : null;
    case "maps":
      return { href: location.mapsUrl, external: true };
    case "instagram":
      return contact.instagram
        ? { href: instagramHref(contact.instagram), external: true }
        : null;
    default:
      return { href: action, external: false };
  }
}
