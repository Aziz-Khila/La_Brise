import Image from "next/image";
import type { Brand, VisitSection } from "@/config/types";
import { Reveal } from "@/components/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { focusStyle, usableSrc } from "@/lib/images";
import { instagramHref, mapEmbedSrc, telHref, whatsappHref } from "@/lib/links";

type VisitProps = {
  section: VisitSection;
  id: string;
  brand: Brand;
};

export function Visit({ section, id, brand }: VisitProps) {
  const { contact, location, hours } = brand;
  const photo =
    section.variant === "photo" && usableSrc(section.image?.src) ? section.image : undefined;
  const mapQuery = location.mapQuery ?? location.address;

  return (
    <section id={id} className="section visit">
      <div className="section-inner visit-layout">
        <div className="visit-copy">
          <SectionIntro
            eyebrow={section.eyebrow}
            title={section.title}
            text={section.text ?? location.note}
          />

          <Reveal as="ul" className="visit-details" delay={120}>
            <li>
              <span>Adresse</span>
              <strong>{location.address}</strong>
            </li>
            {hours.length > 0 && (
              <li>
                <span>Horaires</span>
                <dl className="visit-hours">
                  {hours.map((row) => (
                    <div key={row.days}>
                      <dt>{row.days}</dt>
                      <dd>{row.time}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            )}
            {contact.phone && (
              <li>
                <span>Téléphone</span>
                <strong>
                  <a href={telHref(contact.phone)}>{contact.phone}</a>
                </strong>
              </li>
            )}
            {contact.whatsapp && contact.whatsapp !== contact.phone && (
              <li>
                <span>WhatsApp</span>
                <strong>
                  <a href={whatsappHref(contact.whatsapp)} target="_blank" rel="noopener noreferrer">
                    {contact.whatsapp}
                  </a>
                </strong>
              </li>
            )}
            {contact.instagram && (
              <li>
                <span>Instagram</span>
                <strong>
                  <a href={instagramHref(contact.instagram)} target="_blank" rel="noopener noreferrer">
                    @{contact.instagram.replace(/^@/, "")}
                  </a>
                </strong>
              </li>
            )}
            {contact.email && (
              <li>
                <span>Email</span>
                <strong>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </strong>
              </li>
            )}
          </Reveal>

          <Reveal className="visit-actions" delay={180}>
            <a className="btn btn-primary" href={location.mapsUrl} target="_blank" rel="noopener noreferrer">
              Ouvrir dans Maps
            </a>
            {contact.instagram && (
              <a
                className="btn btn-ghost"
                href={instagramHref(contact.instagram)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
          </Reveal>
        </div>

        {photo ? (
          <Reveal className="map-panel" delay={120}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
              className="map-photo"
              style={focusStyle(photo)}
            />
            <div className="map-veil" aria-hidden="true" />
            <a className="map-card" href={location.mapsUrl} target="_blank" rel="noopener noreferrer">
              <div className="map-card-top">
                <span className="map-card-kicker">Localisation</span>
                <span className="map-card-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
              <strong className="map-card-title">{brand.name}</strong>
              <p className="map-card-text">{location.note ?? location.address}</p>
              <span className="map-card-cta">Voir l’itinéraire</span>
            </a>
          </Reveal>
        ) : (
          <Reveal className="map-panel map-panel--embed" delay={120}>
            <iframe
              title={`Carte — ${brand.name}`}
              src={mapEmbedSrc(mapQuery)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
