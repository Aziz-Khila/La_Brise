import type { MotionLevel, ThemePresetId } from "@/config/types";
import { themePresets } from "@/config/themes";

type PreviewBarProps = {
  slug: string;
  slugs: string[];
  theme: ThemePresetId;
  motion: MotionLevel;
};

const motionLabels: Record<MotionLevel, string> = {
  rich: "Riche",
  subtle: "Subtil",
  none: "Aucune",
};

export function PreviewBar({ slug, slugs, theme, motion }: PreviewBarProps) {
  const href = (next: { slug?: string; theme?: string; motion?: string }) => {
    const target = next.slug ?? slug;
    if (next.slug) return `/preview/${target}`;
    const params = new URLSearchParams({
      theme: next.theme ?? theme,
      motion: next.motion ?? motion,
    });
    return `/preview/${target}?${params}`;
  };

  return (
    <details className="preview-bar">
      <summary>Aperçu</summary>
      <div className="preview-bar-body">
        <div className="preview-group">
          <span>Restaurant</span>
          {slugs.map((value) => (
            <a key={value} href={href({ slug: value })} aria-current={value === slug ? "page" : undefined}>
              {value}
            </a>
          ))}
        </div>
        <div className="preview-group">
          <span>Thème</span>
          {Object.entries(themePresets).map(([id, preset]) => (
            <a key={id} href={href({ theme: id })} aria-current={id === theme ? "page" : undefined}>
              <i style={{ background: preset.colors.background, borderColor: preset.colors.accent }} />
              {preset.label}
            </a>
          ))}
        </div>
        <div className="preview-group">
          <span>Animations</span>
          {(Object.keys(motionLabels) as MotionLevel[]).map((level) => (
            <a key={level} href={href({ motion: level })} aria-current={level === motion ? "page" : undefined}>
              {motionLabels[level]}
            </a>
          ))}
        </div>
      </div>
    </details>
  );
}
