import type { BusinessTemplate, HexColor, StylesOverride } from './business';

export type DocumentStatus = 'draft' | 'published' | 'archived';


export type PageImagePath = `/business/${string}/${string}/${string}.webp`;


export interface Document {
  title: string;
  description?: string;
  status: DocumentStatus;
  pages: PageImagePath[];
  /** Ancho en píxeles de las páginas del PDF, ej: 850. Opcional: si falta, el
   *  flipbook usa su ancho por defecto. */
  imgWidth?: number;
  /** Alto en píxeles de las páginas del PDF, ej: 2125. Opcional, y con el mismo
   *  default que `imgWidth`. */
  imgHeight?: number;
  template?: BusinessTemplate;

  icon?: string;
  background?: HexColor;
  order?: number;
  styles?: StylesOverride;
}