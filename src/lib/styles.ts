import type { CardStylesOverride, StylesOverride } from "./business";

export const BASE_STYLES = {
  colors: {
    background: "#fef8f4",
    surface: "#ffffff",
    text: "#1d1b19",
    textMuted: "#554245",
    accent: "#a03b56",
    border: "#dbc0c4",
  },
  typography: {
    fontFamily: '"Quicksand", system-ui, -apple-system, "Segoe UI", sans-serif',
    headingWeight: 700, // headline-xl/lg
    bodyWeight: 500, // body-md/sm
    scale: 1,
  },
  spacing: {
    gap: 20, // space-lg 1.25rem, extremo generoso del ritmo de la prosa
    padding: 16, // gutter 1rem
    radius: 28, // rounded-3xl 1.75rem
  },
  background: {
    image: "",
  },
};

/**
 * Fusiona los tres niveles de override sobre BASE_STYLES y devuelve las
 * variables CSS que espera `@theme inline` de global.css.
 *
 * El orden NO es decorativo, es la precedencia de la cascada: lo de más
 * derecha pisa a lo de más izquierda.
 *
 *   BASE_STYLES  →  template  →  business.json  →  document.json
 *
 * Los cuatro son opcionales y parciales: con todos en undefined la función
 * devuelve BASE_STYLES pelado, que es lo que pasa en la home.
 *
 * `templateStyles` va en `Partial` por simetría con el resto de la firma; los
 * templates declaran su paleta completa en TS y no lo necesitan.
 *
 * Función pura: no toca el DOM ni el fs. El efecto (inyectar el style en
 * `<html>`) lo hace Layout.astro con lo que esto devuelve.
 */
export function getBusinessStyles(
  templateStyles?: Partial<StylesOverride>,
  businessStyles?: StylesOverride,
  documentStyles?: StylesOverride,
) {
  // Fusionamos por sección, no recursivamente: cada override reemplaza las
  // claves que menciona y las que omite caen al nivel anterior.
  const colors = {
    ...BASE_STYLES.colors,
    ...templateStyles?.colors,
    ...businessStyles?.colors,
    ...documentStyles?.colors,
  };
  const typography = {
    ...BASE_STYLES.typography,
    ...templateStyles?.typography,
    ...businessStyles?.typography,
    ...documentStyles?.typography,
  };
  const spacing = {
    ...BASE_STYLES.spacing,
    ...templateStyles?.spacing,
    ...businessStyles?.spacing,
    ...documentStyles?.spacing,
  };

  const backdrop = resolveBackground([templateStyles, businessStyles, documentStyles]);

  return {
    "--background": colors.background,
    "--surface": colors.surface,
    "--ink": colors.text,
    "--muted": colors.textMuted,
    "--accent": colors.accent,
    "--border": colors.border,

    "--type-font": typography.fontFamily,
    "--type-weight-heading": String(typography.headingWeight),
    "--type-weight-body": String(typography.bodyWeight),
    "--type-scale": String(typography.scale),

    "--space-padding": `${spacing.padding}px`,
    "--space-gap": `${spacing.gap}px`,
    "--space-radius": `${spacing.radius}px`,

    "--backdrop": backdrop.image ? `url('${backdrop.image}')` : "none",
    "--backdrop-poster": backdrop.videoPoster ? `url('${backdrop.videoPoster}')` : "none",
  };
}

export interface ResolvedBackground {
  image?: string;
  video?: string;
  videoPoster?: string;
}

function resolveBackground(levels: (Partial<StylesOverride> | undefined)[]): ResolvedBackground {
  const pick = (key: "image" | "video" | "videoPoster") => {
    let value: string | undefined;
    for (const level of levels) {
      const declared = level?.background?.[key];
      if (declared !== undefined) value = declared || undefined;
    }
    return value;
  };

  const video = pick("video");
  const videoPoster = pick("videoPoster");

  return {
    image: pick("image"),
    video: video && videoPoster ? video : undefined,
    videoPoster,
  };
}

export function getBusinessBackground(
  templateStyles?: Partial<StylesOverride>,
  businessStyles?: StylesOverride,
  documentStyles?: StylesOverride,
): ResolvedBackground {
  return resolveBackground([templateStyles, businessStyles, documentStyles]);
}

/**
 * Variables CSS de las tarjetas del perfil del negocio.
 *
 * Aparte de `getBusinessStyles` a propósito: `cardStyles` es hermano de
 * `styles`, no un quinto nivel de la cascada, y solo business.json lo declara.
 *
 * Lo que no se declaró sale `undefined`, y eso es lo correcto: `toStyleString` de
 * Astro (runtime/server/render/util.js) descarta los valores que no son string
 * ni número, así que la propiedad no llega al `<html>` y gana el fallback que
 * declara el template en tokens.css.
 *
 * Los tokens son `--card-*` y NO tocan `--surface`/`--border`/`--ink`/`--muted`:
 * esos son compartidos con siete cosas más (Legal, imágenes del noscript, los
 * dos botones del flipBook, el borde del logo, el hover del botón de volver).
 * Un namespace aparte es lo que permite que un negocio tenga tarjetas de un
 * color y un `--surface` de otro sin que uno le pise al otro.
 */
export function getCardStyles(cardStyles?: CardStylesOverride): Record<string, string | undefined> {
  const colors = cardStyles?.colors ?? {};
  return {
    "--card-bg": colors.background,
    "--card-border": colors.border,
    "--card-fg": colors.foreground,
    "--card-fg-muted": colors.foregroundMuted,
  };
}
