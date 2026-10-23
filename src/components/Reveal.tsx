"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, onScroll } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?:
    | "div"
    | "p"
    | "h1"
    | "h2"
    | "h3"
    | "cite"
    | "blockquote"
    | "ul"
    | "figure"
    | "article";
  delay?: number;
};

export function Reveal({
  children,
  className = "",
  as: Tag = "div",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.classList.add("is-visible");
      return;
    }

    const animation = animate(el, {
      opacity: [0, 1],
      y: [28, 0],
      duration: 900,
      delay,
      ease: "out(3)",
      autoplay: onScroll({
        target: el,
        repeat: false,
        enter: "bottom-=12%",
      }),
    });

    return () => {
      animation.pause();
      animation.revert();
    };
  }, [delay]);

  return (
    <Tag ref={ref as never} className={`reveal ${className}`.trim()}>
      {children}
    </Tag>
  );
}
