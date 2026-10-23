"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import type { Brand, ReservationSection } from "@/config/types";
import { Reveal } from "@/components/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { PhoneIcon, WhatsappIcon } from "@/components/ui/Icons";
import { focusStyle, usableSrc } from "@/lib/images";
import { telHref, whatsappHref } from "@/lib/links";

type ReservationProps = {
  section: ReservationSection;
  id: string;
  brand: Brand;
};

function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

function ContactButtons({ brand }: { brand: Brand }) {
  const { whatsapp, phone } = brand.contact;
  return (
    <div className="reservation-buttons">
      {whatsapp && (
        <a
          className="btn btn-primary btn-icon"
          href={whatsappHref(whatsapp, `Bonjour ${brand.name}, je souhaite réserver une table.`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsappIcon />
          Réserver sur WhatsApp
        </a>
      )}
      {phone && (
        <a className="btn btn-ghost btn-icon" href={telHref(phone)}>
          <PhoneIcon />
          {phone}
        </a>
      )}
    </div>
  );
}

function ReservationForm({ brand, maxGuests }: { brand: Brand; maxGuests: number }) {
  const [minDate, setMinDate] = useState<string>();

  useEffect(() => {
    setMinDate(todayIso());
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const whatsapp = brand.contact.whatsapp;
    if (!whatsapp) return;

    const data = new FormData(event.currentTarget);
    const note = String(data.get("note") ?? "").trim();
    const lines = [
      `Bonjour ${brand.name}, je souhaite réserver une table.`,
      "",
      `Nom : ${data.get("name")}`,
      `Date : ${formatDate(String(data.get("date")))}`,
      `Heure : ${data.get("time")}`,
      `Personnes : ${data.get("guests")}`,
      ...(note ? [`Remarque : ${note}`] : []),
    ];

    window.open(whatsappHref(whatsapp, lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  return (
    <form className="reservation-form" onSubmit={onSubmit}>
      <label className="field field--full">
        <span>Nom</span>
        <input name="name" type="text" autoComplete="name" required placeholder="Votre nom" />
      </label>
      <label className="field">
        <span>Date</span>
        <input name="date" type="date" required min={minDate} />
      </label>
      <label className="field">
        <span>Heure</span>
        <input name="time" type="time" required step={900} />
      </label>
      <label className="field field--full">
        <span>Personnes</span>
        <select name="guests" defaultValue="2" required>
          {Array.from({ length: maxGuests }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "personne" : "personnes"}
            </option>
          ))}
        </select>
      </label>
      <label className="field field--full">
        <span>Remarque (optionnel)</span>
        <textarea name="note" rows={3} placeholder="Anniversaire, terrasse, chaise bébé…" />
      </label>
      <button type="submit" className="btn btn-primary btn-icon field--full">
        <WhatsappIcon />
        Envoyer la demande
      </button>
      {brand.contact.phone && (
        <p className="reservation-alt">
          Ou appelez-nous au <a href={telHref(brand.contact.phone)}>{brand.contact.phone}</a>
        </p>
      )}
    </form>
  );
}

export function Reservation({ section, id, brand }: ReservationProps) {
  const canUseForm = section.variant === "form" && Boolean(brand.contact.whatsapp);

  if (!canUseForm) {
    return (
      <section id={id} className="section reservation reservation--compact">
        <div className="section-inner">
          <Reveal className="reservation-banner">
            <SectionIntro eyebrow={section.eyebrow} title={section.title} text={section.text} />
            <ContactButtons brand={brand} />
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="section reservation reservation--form">
      <div className="section-inner reservation-layout">
        <div className="reservation-copy">
          <SectionIntro eyebrow={section.eyebrow} title={section.title} text={section.text} />
          {section.image && usableSrc(section.image.src) && (
            <Reveal className="reservation-visual" delay={120}>
              <Image
                src={section.image.src}
                alt={section.image.alt}
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                style={focusStyle(section.image)}
              />
            </Reveal>
          )}
        </div>
        <Reveal className="reservation-card" delay={100}>
          <ReservationForm brand={brand} maxGuests={section.maxGuests ?? 10} />
        </Reveal>
      </div>
    </section>
  );
}
