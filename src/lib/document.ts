import type { BusinessTemplate, HexColor, StylesOverride } from './business';

export type DocumentStatus = 'draft' | 'published' | 'archived';

/**
 * Patrón regex para las páginas: "^\\./pages/[0-9]{2}\\.webp$"
 */
export type PageImagePath = string;

/**
 * Un menú. Se llama `Document` y no `Menu` porque así está en el schema y en el
 * archivo (`document.json`), pero cuidado: dentro de este módulo y en quien lo
 * importe, `Document` tapa el `Document` del DOM.
 *
 * Vive acá y no en `business.ts` para que el tipo de un menú tenga un solo dueño:
 * `DocumentStatus` y `PageImagePath` son sus piezas y no tienen por qué viajar
 * sueltas en un módulo que habla de negocios.
 */
export interface Document {
  title: string;
  description?: string;
  status: DocumentStatus;
  pages: PageImagePath[];
  template?: BusinessTemplate;
  /** Ícono del badge de la tarjeta, sintaxis Iconify. Debe estar en el `include`
   *  de astro-icon.config o el build no lo encuentra. Opcional: sin ícono la
   *  tarjeta se dibuja sin badge. */
  icon?: string;
  /** Color propio del badge. Opcional: si falta, cicla por posición. */
  background?: HexColor;
  /** Posición en la página del negocio, ascendente. Opcional: los que no lo
   *  declaran van al final, en orden alfabético. El orden por defecto del
   *  filesystem es alfabético, y para un restaurante eso deja la carta en el
   *  medio de la lista. */
  order?: number;
  styles?: StylesOverride;
}