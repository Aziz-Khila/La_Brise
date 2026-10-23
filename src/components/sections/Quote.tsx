"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, onScroll } from "animejs";
import type { QuoteSection } from "@/config/types";
import { Reveal } from "@/components/Reveal";
import { focusStyle, usableSrc } from "@/lib/images";
import { allowsParallax } from "@/lib/motion";

type QuoteProps = {
  section: QuoteSection;
  id: string;
};

export function Quote({ section, id }: QuoteProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    const media = mediaRef.current;
    if (!root || !media || !allowsParallax()) return;

    const drift = animate(media, {
      y: ["-4%", "8%"],
      scale: [1.06, 1.14],
      ease: "linear",
      autoplay: onScroll({
        target: root,
        sync: true,
        enter: "top bottom",
        leave: "bottom top",
      }),
    });

    return () => {
      drift.pause();
      drift.revert();
    };
  }, []);

  return (
    <section id={id} className="section quote" ref={sectionRef}>
      <div className="quote-media" aria-hidden="true" ref={mediaRef}>
        {usableSrc(section.image.src) && (
          <Image src={section.image.src} alt="" fill sizes="100vw" style={focusStyle(section.image)} />
        )}
        <div className="quote-veil" />
      </div>
      <Reveal as="blockquote" className="quote-text">
        <p>{section.quote}</p>
        {section.cite && <cite>{section.cite}</cite>}
      </Reveal>
    </section>
  );
}
