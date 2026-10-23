"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, onScroll } from "animejs";
import type { AboutSection } from "@/config/types";
import { Reveal } from "@/components/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { focusStyle, usableSrc } from "@/lib/images";
import { allowsParallax } from "@/lib/motion";

type AboutProps = {
  section: AboutSection;
  id: string;
};

export function About({ section, id }: AboutProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLSpanElement>(null);

  const whole = Boolean(section.image.whole);

  useEffect(() => {
    const root = sectionRef.current;
    const media = mediaRef.current?.querySelector("img");
    if (!root || !media || whole || !allowsParallax()) return;

    const parallax = animate(media, {
      y: ["-6%", "6%"],
      ease: "linear",
      autoplay: onScroll({
        target: root,
        sync: true,
        enter: "top bottom",
        leave: "bottom top",
      }),
    });

    return () => {
      parallax.pause();
      parallax.revert();
    };
  }, [whole, section.image.src]);

  return (
    <section
      id={id}
      className={`section about about--${section.variant}`}
      ref={sectionRef}
    >
      <div className="section-inner about-grid">
        <div className="about-copy">
          <SectionIntro
            eyebrow={section.eyebrow}
            title={section.title}
            text={section.text}
          />
          {section.highlights && section.highlights.length > 0 && (
            <Reveal as="ul" className="about-highlights" delay={140}>
              {section.highlights.map((item) => (
                <li key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </li>
              ))}
            </Reveal>
          )}
        </div>
        <Reveal as="figure" className={`about-visual${whole ? " is-whole" : ""}`} delay={120}>
          <span className="about-media" ref={mediaRef}>
            {usableSrc(section.image.src) &&
              (whole ? (
                <Image
                  key={section.image.src}
                  src={section.image.src}
                  alt={section.image.alt}
                  width={1200}
                  height={1500}
                  sizes="(max-width: 900px) 100vw, 45vw"
                />
              ) : (
                <Image
                  key={section.image.src}
                  src={section.image.src}
                  alt={section.image.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 45vw"
                  style={focusStyle(section.image)}
                />
              ))}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
