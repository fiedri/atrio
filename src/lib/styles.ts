import type { StylesOverride } from "./business";

/**
 * Paleta y medidas por defecto del frontend: el piso de la cascada.
 *
 * Layout.astro inyecta SIEMPRE estos tokens en `<html>`, aunque la página no
 * tenga template ni JSON de estilos. Por eso `--surface-background` y compañía
 * nunca quedan sin definir y `@layer base { html { … } }` de global.css siempre
 * resuelve contra algo real.
 *
 * Los valores salen del frontmatter de DESIGN.md. El frontmatter define ~47
 * tokens; el schema sólo expone 6 colores, 1 familia y 3 medidas. Este es el
 * mapeo de los primeros a los segundos, y es la única traducción posible sin
 * ampliar `StylesOverride`:
 *
 *   background → surface                     #fef8f4  base del canvas
 *   surface    → surface-container-lowest    #ffffff  tarjetas, Level 1
 *   text       → on-surface                  #1d1b19
 *   textMuted  → on-surface-variant          #554245
 *   accent     → primary                     #a03b56
 *   border     → outline-variant             #dbc0c4
 *
 * Manda el frontmatter, no la prosa: la sección de Brand del documento
 * describe otro accent (#FF85A1) y otro texto (#3D2E39), pero esos no pasan
 * contraste sobre superficie clara.
 *
 * Lo que NO entra acá y queda fuera del alcance del schema:
 *   - Comfortaa para titulares: `fontFamily` es una sola variable y ya la usa
 *     el cuerpo. Comfortaa vive como `--type-font-display`, que lo declara el
 *     `tokens.css` de cada template (utility `font-display`).
 *   - secondary #006a65, tertiary #785a00, surface-container-*.
 *   - `radius` es único: 28px sirve para tarjetas grandes (rounded-3xl), pero
 *     los botones pill de DESIGN.md usan `rounded-full` de Tailwind.
 *
 * INVARIANTE DE NOMBRES — los nombres que emite `getBusinessStyles` están
 * RESERVADOS. Un template NO puede declararlos en su `tokens.css`:
 *
 *   --surface-background  --surface-surface  --surface-ink
 *   --surface-muted       --surface-accent   --surface-border
 *   --type-font           --type-weight-heading  --type-weight-body
 *   --type-scale          --space-padding       --space-gap
 *   --space-radius        --backdrop
 *
 * La lista es exactamente el objeto que devuelve `getBusinessStyles`: si le
 * agregás un nombre que la función no emite, estás reservando algo que ningún
 * nivel escribe y el template que lo use se rompe; si te olvidás de uno que sí
 * emite, perdés el token en silencio.
 *
 * `--type-font-display` NO está y no tiene que estarlo: no lo emite esta
 * función, lo declara el `tokens.css` del template (`pastel-link-hub`) como
 * `--type-font-display`. Lo que se pierde en silencio es el token del schema,
 * no el del template.
 *
 * Motivo: los tres niveles de la cascada se pisan por nombre, no por
 * especificidad intencional. El nivel template escribe en
 * `html[data-template="…"]` (0,1,1) y el nivel inline escribe en el atributo
 * `style` de `<html>` (1,0,0,0). Si un template declara un nombre reservado,
 * el `var()` inline gana SIEMPRE y el CSS del template se pierde en silencio:
 * el token compila, la página renderiza y el color no cambia. Los sets de
 * propiedades de `tokens.css` y del objeto `styles` del template tienen que
 * ser DISJUNTOS, y esta lista es contra la que se chequea.
 */
export const BASE_STYLES = {
  colors: {
    background: '#fef8f4',
    surface: '#ffffff',
    text: '#1d1b19',
    textMuted: '#554245',
    accent: '#a03b56',
    border: '#dbc0c4',
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
    image: '',
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

  // El fondo se resuelve aparte porque hay que leer un campo anidado
  // (`background.image`) y no una sección entera: el último nivel que declara
  // una ruta gana. `''` significa "sin fondo" y no pisa a un nivel anterior que
  // sí puso algo, salvo que sea el último y quede en `none`.
  const image = [templateStyles, businessStyles, documentStyles].reduce<string | undefined>(
    (carry, level) => level?.background?.image || carry,
    undefined,
  );

  // Retornamos un objeto con las variables CSS exactas que espera tu @theme inline
  return {
    '--surface-background': colors.background,
    '--surface-surface': colors.surface,
    '--surface-ink': colors.text,
    '--surface-muted': colors.textMuted,
    '--surface-accent': colors.accent,
    '--surface-border': colors.border,

    '--type-font': typography.fontFamily,
    '--type-weight-heading': String(typography.headingWeight),
    '--type-weight-body': String(typography.bodyWeight),
    '--type-scale': String(typography.scale),

    '--space-padding': `${spacing.padding}px`,
    '--space-gap': `${spacing.gap}px`,
    '--space-radius': `${spacing.radius}px`,

    '--backdrop': image ? `url('${image}')` : 'none',
  };
}