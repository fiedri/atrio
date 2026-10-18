export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'whatsapp'
  | 'web'
  | 'tripadvisor'
  | 'delivery';

/**
 * Cada valor tiene que existir en TEMPLATES (src/lib/templates.ts) y, si es un
 * stub, el JSON que lo use tiene que cambiar antes de publicar: `resolveTemplate`
 * tira en build antes de que llegue al render.
 */
export type BusinessTemplate = 'editorial' | 'grid' | 'gallery' | 'pastel-link-hub';

export type HexColor = string; // Patrón: ^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label?: string;
  icon?: string;
  background?: HexColor;
}

export interface ColorsOverride {
  background?: HexColor;
  surface?: HexColor;
  text?: HexColor;
  textMuted?: HexColor;
  accent?: HexColor;
  border?: HexColor;
}

/**
 * Colores propios de las tarjetas de la página del negocio.
 *
 * Es hermano de `styles`, no una sección más de la cascada. Las tarjetas se
 * dibujan en un solo lugar (BusinessView.astro), una por documento y todas con
 * las mismas clases: por eso va en el business y no en cada document.json, que
 * serían N copias de un bloque que además no podría variar una tarjeta suelta.
 *
 * Cada clave es opcional y resuelve contra su token global equivalente
 * (`--surface`, `--border`, `--ink`, `--muted`), así que un negocio que no
 * declare nada ve exactamente lo que veía antes.
 */
export interface CardColorsOverride {
  background?: HexColor; // fondo de la tarjeta
  border?: HexColor;     // borde de la tarjeta
  foreground?: HexColor; // texto principal: el título del documento
  foregroundMuted?: HexColor; // texto secundario: descripción y páginas
}

export interface CardStylesOverride {
  colors?: CardColorsOverride;
}

export interface TypographyOverride {
  fontFamily?: string;
  headingWeight?: number; // 100 - 900
  bodyWeight?: number;    // 100 - 900
  scale?: number;         // 0.5 - 3
}

export interface SpacingOverride {
  gap?: number;     // 0 - 64
  padding?: number; // 0 - 64
  radius?: number;  // 0 - 64
}

export interface BackgroundOverride {
  image?: string;
  video?: string;
  videoPoster?: string; // Obligatorio si hay video
}

export interface StylesOverride {
  colors?: ColorsOverride;
  typography?: TypographyOverride;
  spacing?: SpacingOverride;
  background?: BackgroundOverride;
}

export interface Business {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive?: boolean;
  /**
   * Si se omite es `true`: los negocios que ya existen siguen generando su
   * página. Con `false` los menús se publican igual pero `/<slug>` no se
   * genera, y por eso los menús tampoco pueden ofrecer un link de vuelta.
   */
  showProfile?: boolean;
  template: BusinessTemplate;
  socialLinks: SocialLink[];
  styles?: StylesOverride;
  /** Colores propios de las tarjetas del perfil. Solo los declara el negocio:
   *  ver `CardColorsOverride`. Opcional. */
  cardStyles?: CardStylesOverride;
}
