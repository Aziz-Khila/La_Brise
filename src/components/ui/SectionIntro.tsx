import { Reveal } from "@/components/Reveal";

type SectionIntroProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  className?: string;
};

export function SectionIntro({ eyebrow, title, text, className = "" }: SectionIntroProps) {
  return (
    <div className={`section-intro ${className}`.trim()}>
      {eyebrow && (
        <Reveal as="p" className="eyebrow">
          {eyebrow}
        </Reveal>
      )}
      <Reveal as="h2">{title}</Reveal>
      {text && (
        <Reveal as="p" className="lead" delay={90}>
          {text}
        </Reveal>
      )}
    </div>
  );
}
