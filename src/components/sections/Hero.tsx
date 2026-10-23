"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, createTimeline, onScroll } from "animejs";
import type { Brand, HeroSection } from "@/config/types";
import { CtaButton } from "@/components/ui/CtaButton";
import { focusStyle, usableSrc } from "@/lib/images";
import { allowsParallax, prefersReducedMotion } from "@/lib/motion";

type HeroProps = {
  section: HeroSection;
  brand: Brand;
};

export function Hero({ section, brand }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const { variant, image, primaryCta, secondaryCta } = section;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const steps = ["brand", "title", "headline", "tagline", "actions"]
      .map((key) => root.querySelector<HTMLElement>(`[data-hero='${key}']`))
      .filter((el): el is HTMLElement => Boolean(el));
    const media = root.querySelector<HTMLElement>("[data-hero='media']");

    if (prefersReducedMotion()) {
      steps.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    const rich = allowsParallax();
    const timeline = createTimeline({ defaults: { ease: "out(3)" } });

    if (media && rich) {
      timeline.add(media, { scale: [1.08, 1], duration: 2200, ease: "out(2)" }, 0);
    }
    steps.forEach((el, index) => {
      timeline.add(
        el,
        { opacity: [0, 1], y: [index === 1 ? 32 : 20, 0], duration: 900 },
        80 + index * 85
      );
    });

    let parallax: ReturnType<typeof animate> | undefined;
    if (media && rich) {
      parallax = animate(media, {
        y: [0, 40],
        ease: "linear",
        autoplay: onScroll({
          target: root,
          sync: 0.35,
          enter: "top top",
          leave: "bottom top",
        }),
      });
    }

    return () => {
      timeline.pause();
      timeline.revert();
      parallax?.pause();
      parallax?.revert();
    };
  }, []);

  const fullBleed = variant !== "split";

  return (
    <section className={`hero hero--${variant}`} ref={rootRef}>
      {fullBleed && (
        <div className="hero-media" aria-hidden="true" data-hero="media">
          {usableSrc(image.src) && (
            <Image
              src={image.src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="hero-img"
              style={focusStyle(image)}
            />
          )}
          <div className="hero-veil" />
        </div>
      )}

      <div className="hero-shell">
        <div className="hero-copy">
          {section.eyebrow && (
            <p className="brand-line hero-enter" data-hero="brand">
              {section.eyebrow}
            </p>
          )}
          <h1 className="brand hero-enter" data-hero="title">
            {section.title ?? brand.name}
          </h1>
          {section.headline && (
            <p className="hero-headline hero-enter" data-hero="headline">
              {section.headline}
            </p>
          )}
          {section.text && (
            <p className="hero-tagline hero-enter" data-hero="tagline">
              {section.text}
            </p>
          )}
          {(primaryCta || secondaryCta) && (
            <div className="hero-actions hero-enter" data-hero="actions">
              {primaryCta && (
                <CtaButton cta={primaryCta} brand={brand} className="btn-hero" />
              )}
              {secondaryCta && (
                <CtaButton cta={secondaryCta} brand={brand} variant="ghost" />
              )}
            </div>
          )}
        </div>

        {!fullBleed && (
          <div className="hero-frame">
            <div className="hero-frame-media" data-hero="media">
              {usableSrc(image.src) && (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className="hero-img"
                  style={focusStyle(image)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
