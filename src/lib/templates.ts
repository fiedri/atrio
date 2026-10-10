import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { BusinessTemplate, StylesOverride } from './business';
import Placeholder from '../templates/_stub/Placeholder.astro';
import pastel from '../templates/pastel-link-hub/index.ts';
import PastelBusinessView from '../templates/pastel-link-hub/BusinessView.astro';
import PastelDocumentView from '../templates/pastel-link-hub/DocumentView.astro';

/**
 * Un template es un par de vistas más la capa de tokens que las envuelve.
 *
 * Las vistas reciben datos YA resueltos (el loader los trae en las props de
 * getStaticPaths) y son responsables de inyectar los tokens en `<html>`, porque
 * los tokens son por ruta: los de business.json en la página del negocio, los
 * de document.json agregados en la del menú.
 *
 * Ojo con el tipo de las vistas: Astro 7 sacó el `Component` genérico que
 * existía en el root de `astro`. Lo que queda es `AstroComponentFactory`, que
 * es la firma real de una vista `.astro` (sin genéricos de props, así que acá
 * no hay forma de(Index) que cada vista acepte exactamente lo que declara).
 */
export interface TemplateDef {
  id: BusinessTemplate;
  /** Tokens del template. Tiene que ser DISJUNTO de su tokens.css. */
  styles: Partial<StylesOverride>;
  /**
   * Si tiene vistas de verdad o es un stub.
   *
   * Vive acá y no en un set paralelo a propósito: un set aparte es un segundo
   * lugar que hay que acordarse de tocar, y al que se olvida lo descubre
   * `resolveTemplate` en runtime, tirando sobre un template que anda bien.
   * Con el flag en la entrada, `satisfies Record<BusinessTemplate, TemplateDef>`
   * obliga a que TODO template diga si está implementado.
   */
  implemented: boolean;
  BusinessView: AstroComponentFactory;
  DocumentView: AstroComponentFactory;
}

export const TEMPLATES = {
  'pastel-link-hub': {
    id: pastel.id,
    styles: pastel.styles,
    implemented: true,
    BusinessView: PastelBusinessView,
    DocumentView: PastelDocumentView,
  },
  editorial: stub('editorial'),
  grid: stub('grid'),
  gallery: stub('gallery'),
} satisfies Record<BusinessTemplate, TemplateDef>;

/**
 * Stubs: existen para que el enum de templates y los JSON published puedan
 * seguir nombrándolos sin romper el typecheck. `styles` vacío a propósito: un
 * stub no inyecta tokens, y declarar más de lo que implementa sería peor que
 * no declarar nada.
 */
function stub(id: BusinessTemplate): TemplateDef {
  return {
    id,
    styles: {},
    implemented: false,
    BusinessView: Placeholder,
    DocumentView: Placeholder,
  };
}

/**
 * Resuelve el id del JSON al template que lo dibuja.
 *
 * Falla acá y no en el render a propósito: un componente que tira durante el
 * render deja un stack trace de tres frames de Astro por medio, mientras que
 * un error de módulo deja el mensaje entero arriba. En un build estático,
 * además, el error de módulo corta antes de generar media hora de HTML inútil.
 */
export function resolveTemplate(id: string): TemplateDef {
  const def = TEMPLATES[id as BusinessTemplate];

  if (!def) {
    throw new Error(
      `Template desconocido: "${id}". Los registrados son: ${Object.keys(TEMPLATES).join(', ')}. ` +
        `Para usar "${id}" creá src/templates/${id}/ con index.ts (id + styles), ` +
        `BusinessView.astro y DocumentView.astro, y agregalo a TEMPLATES. ` +
        `Si en realidad no existe, sacalo del enum BusinessTemplate (src/lib/business.ts) ` +
        `y de los enums de schemas/businesses.json y schemas/documents.json.`,
    );
  }

  if (!def.implemented) {
    throw new Error(
      `Template "${def.id}" registrado pero no implementado: es un stub en src/lib/templates.ts. ` +
        `Implementá src/templates/${def.id}/ (index.ts, BusinessView.astro, DocumentView.astro) ` +
        `y poné \`implemented: true\` en su entrada de TEMPLATES, o sacá "${def.id}" ` +
        `del enum BusinessTemplate (src/lib/business.ts) y cambiá los JSON que lo usen.`,
    );
  }

  return def;
}