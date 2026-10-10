import type { BusinessTemplate, StylesOverride } from './business';

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
  /** Si se omite, se hereda el del business.json (ver pages/[document].astro). */
  template?: BusinessTemplate;
  styles?: StylesOverride;
}