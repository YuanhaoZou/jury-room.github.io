import type { PersonaArchetype, PersonaColor } from "../types";
import { colorPalette } from "../theme";

export function ChefSprite({
  archetype,
  color,
  upset,
}: {
  archetype: PersonaArchetype;
  color: PersonaColor;
  upset: boolean;
}) {
  const fill = colorPalette[color];
  const hat =
    archetype === "veteran"
      ? "#C06028"
      : archetype === "genz"
        ? "#C85898"
        : archetype === "exec"
          ? "#2E79B5"
          : archetype === "advocate"
            ? "#1F8A65"
            : archetype === "skeptic"
              ? "#C9A227"
              : "#7B64B8";
  const body = archetype === "exec" ? "#5A6CC0" : fill;

  return (
    <svg width={56} height={64} viewBox="0 0 56 64" aria-hidden>
      {upset && (
        <>
          <circle
            className="steam-dot"
            cx={18}
            cy={8}
            r={4}
            fill={fill}
            style={{ animationDelay: "0s" }}
          />
          <circle
            className="steam-dot"
            cx={28}
            cy={4}
            r={5}
            fill={fill}
            style={{ animationDelay: "0.2s" }}
          />
          <circle
            className="steam-dot"
            cx={38}
            cy={8}
            r={4}
            fill={fill}
            style={{ animationDelay: "0.4s" }}
          />
        </>
      )}
      <rect x={14} y={38} width={28} height={22} rx={6} fill={body} />
      <rect x={10} y={28} width={36} height={12} rx={4} fill={hat} />
      <circle cx={28} cy={22} r={14} fill="#E4E4E4" />
      <circle cx={22} cy={21} r={2.5} fill="#141414" />
      <circle cx={34} cy={21} r={2.5} fill="#141414" />
      {upset ? (
        <path
          d="M22 30 Q28 26 34 30"
          stroke="#CF2D56"
          strokeWidth={2}
          fill="none"
        />
      ) : (
        <path
          d="M22 29 Q28 33 34 29"
          stroke="#141414"
          strokeWidth={2}
          fill="none"
        />
      )}
      <rect x={20} y={52} width={6} height={10} rx={2} fill="#8888A8" />
      <rect x={30} y={52} width={6} height={10} rx={2} fill="#8888A8" />
    </svg>
  );
}
