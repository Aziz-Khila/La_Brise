import type { RestaurantConfig, SectionConfig } from "@/config/types";

/** Layout and behaviour stay with the developer; the owner only edits text, photos and data. */
const LOCKED_SECTION_KEYS = [
  "type",
  "id",
  "navLabel",
  "enabled",
  "variant",
  "primaryCta",
  "secondaryCta",
  "orderButton",
  "maxGuests",
] as const;

type OwnerContent = Pick<RestaurantConfig, "menu" | "contact" | "location" | "hours" | "sections">;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

function isOwnerContent(value: unknown): value is OwnerContent {
  if (!isObject(value)) return false;
  const { menu, contact, location, hours, sections } = value;
  return (
    Array.isArray(menu) &&
    menu.every(
      (category) =>
        isObject(category) &&
        isString(category.id) &&
        isString(category.name) &&
        Array.isArray(category.items) &&
        category.items.every(
          (item) =>
            isObject(item) &&
            isString(item.name) &&
            (isString(item.price) || typeof item.price === "number")
        )
    ) &&
    isObject(contact) &&
    Object.values(contact).every((field) => field === undefined || isString(field)) &&
    isObject(location) &&
    isString(location.address) &&
    isString(location.mapsUrl) &&
    Array.isArray(hours) &&
    hours.every((row) => isObject(row) && isString(row.days) && isString(row.time)) &&
    Array.isArray(sections) &&
    sections.every((section) => isObject(section) && isString(section.type))
  );
}

function lockSection(section: SectionConfig, edited: unknown): SectionConfig {
  if (!isObject(edited) || edited.type !== section.type) return section;
  const next: Record<string, unknown> = { ...edited };
  for (const key of LOCKED_SECTION_KEYS) {
    if (key in section) next[key] = section[key as keyof SectionConfig];
    else delete next[key];
  }
  return next as SectionConfig;
}

/** Applies the owner's fields onto the current content; returns null when the payload is malformed. */
export function applyOwnerEdits(current: RestaurantConfig, edited: unknown): RestaurantConfig | null {
  if (!isOwnerContent(edited)) return null;
  return {
    ...current,
    menu: edited.menu,
    contact: edited.contact,
    location: edited.location,
    hours: edited.hours,
    sections: current.sections.map((section, index) => lockSection(section, edited.sections[index])),
  };
}
