import type { BusinessTemplate, StylesOverride } from '@/lib/business';

/**
 * Identidad del template. Va en `styles` y no hardcodeada en el marcado para
 * que `Layout.astro` la pueda poner en `<html data-template>` sin que cada vista
 * se acuerde de pasarla.
 */
export const id = 'pastel-link-hub' satisfies BusinessTemplate;

/**
 * Paleta y ritmo del template.
 *
 * Vienen del frontmatter de DESIGN.md y son un subconjunto de lo que ya
 * declara `BASE_STYLES` (src/lib/styles.ts). No es duplicación gratuita: este
 * es el nivel "template" de la cascada, y existe para que la página de este
 * template se vea igual aunque alguien cambie BASE_STYLES para el resto del
 * frontend. Si se copia tal cual desde BASE_STYLES, este objeto se puede borrar
 * y el template sigue funcionando — es intencionalmente el mismo contrato de
 * 6 colores / 1 familia / 3 medidas.
 *
 * Lo que NO puede expresar este schema, y por eso vive en `tokens.css`:
 * secondary #006a65, tertiary #785a00, la rampa surface-container-*, la fuente
 * display (Comfortaa), la escala de radios, la de espaciado y las sombras de
 * elevation. Son tokens del template, no del JSON editable por el negocio.
 *
 * INVARIANTE: este objeto y `tokens.css` no pueden declarar el mismo nombre de
 * custom property. El `style` inline de `<html>` (1,0,0,0) le gana siempre a
 * `html[data-template="pastel-link-hub"]` (0,1,1), así que un nombre repetido
 * hace que el lado CSS se pierda sin error. Ver la lista de nombres reservados
 * en BASE_STYLES.
 */
export const styles: Partial<StylesOverride> = {
  colors: {
    background: '#fef8f4', // surface
    surface: '#ffffff', // surface-container-lowest
    text: '#1d1b19', // on-surface
    textMuted: '#554245', // on-surface-variant
    accent: '#a03b56', // primary
    border: '#dbc0c4', // outline-variant
  },
  typography: {
    fontFamily: '"Quicksand", system-ui, -apple-system, "Segoe UI", sans-serif',
    headingWeight: 700, // headline-xl/lg
    bodyWeight: 500, // body-md/sm
    scale: 1,
  },
  spacing: {
    gap: 20, // space-lg 1.25rem
    padding: 16, // gutter 1rem
    radius: 28, // rounded-3xl 1.75rem
  },
};

/**
 * Default export para los `import pastel from '…/index.ts'`.
 *
 * Duplica los dos valores de arriba a propósito: `id` queda con el tipo literal
 * (que es lo que hace que `satisfies BusinessTemplate` valide contra el enum
 * y no contra un string genérico) y el default es el objeto armado, que es lo
 * que leen las vistas.
 */
const definition = { id, styles } as const;

export default definition;