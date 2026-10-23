"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, stagger, onScroll } from "animejs";
import type { FeaturedSection } from "@/config/types";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { focusStyle, usableSrc } from "@/lib/images";
import { prefersReducedMotion } from "@/lib/motion";

type FeaturedProps = {
  section: FeaturedSection;
  id: string;
};

const imageSizes: Record<FeaturedSection["variant"], string> = {
  grid: "(max-width: 620px) 100vw, 50vw",
  cards: "(max-width: 620px) 100vw, (max-width: 900px) 50vw, 33vw",
  editorial: "(max-width: 900px) 100vw, 60vw",
};

export function Featured({ section, id }: FeaturedProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const cards = list.querySelectorAll<HTMLElement>("[data-dish]");
    if (!cards.length) return;

    if (prefersReducedMotion()) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }

    const animation = animate(cards, {
      opacity: [0, 1],
      y: [40, 0],
      duration: 900,
      delay: stagger(100),
      ease: "out(3)",
      autoplay: onScroll({
        target: list,
        repeat: false,
        enter: "bottom-=12%",
      }),
    });

    return () => {
      animation.pause();
      animation.revert();
    };
  }, [section.items.length, section.variant]);

  return (
    <section id={id} className={`section featured featured--${section.variant}`}>
      <div className="section-inner">
        <SectionIntro
          eyebrow={section.eyebrow}
          title={section.title}
          text={section.text}
        />

        <div className="featured-list" ref={listRef}>
          {section.items.map((item, index) => (
            <article className="dish dish-enter" data-dish key={index}>
              <div className="dish-image">
                {usableSrc(item.image.src) && (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes={imageSizes[section.variant]}
                    style={focusStyle(item.image)}
                  />
                )}
              </div>
              <div className="dish-meta">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
