import fs from 'node:fs';
import path from 'node:path';
import type { Business } from './business';
import type { Document } from './document';

/**
 * Único lugar del proyecto que conoce la forma en disco de `public/data`.
 *
 * Las dos páginas dinámicas caminaban el árbol con el mismo `readdirSync`
 * duplicado, y cada una resolvía una mitad distinta: la de negocio nunca leía
 * el document.json de sus menus y la de documento nunca leía el business.json.
 * Ninguna de las dos tenía los dos datos, así que ninguna podía decidir qué
 * template usar.
 *
 * Astro 7 no tiene `Astro.glob` y el output es estático: `getStaticPaths` tiene
 * que devolver TODAS las rutas ya enumeradas en build time. Estas funciones
 * existen para eso.
 *
 * El layout en disco es fijo y en dos niveles:
 *
 *   public/data/<slug>/business.json
 *   public/data/<slug>/<docSlug>/document.json
 *
 * Cualquier carpeta que no tenga ese archivo se ignora en silencio: es la
 * regla que permite que un menú se borre sin tocar los demás.
 */

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

/** Carpetas de primer nivel que contienen un business.json. */
export function listBusinessSlugs(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(DATA_DIR, slug, 'business.json')))
    .sort();
}

/** Carpetas de segundo nivel que contienen un document.json. */
export function listDocumentSlugs(businessSlug: string): string[] {
  const businessDir = path.join(DATA_DIR, businessSlug);
  if (!fs.existsSync(businessDir)) return [];
  return fs
    .readdirSync(businessDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(businessDir, slug, 'document.json')))
    .sort();
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
}

/**
 * Rutas de `/[business]`.
 *
 * `slug` viene en las props además del `params` porque la vista del template
 * necesita armar los href a los menús y el nombre del negocio no es el slug.
 * `documentPaths` también: son el contenido de la página, no un detalle del
 * loader.
 */
export function enumerateBusinessRoutes(): {
  params: { business: string };
  props: { slug: string; business: Business; documentPaths: string[] };
}[] {
  return listBusinessSlugs().map((slug) => ({
    params: { business: slug },
    props: {
      slug,
      business: readJson<Business>(path.join(DATA_DIR, slug, 'business.json')),
      documentPaths: listDocumentSlugs(slug),
    },
  }));
}

/**
 * Rutas de `/[business]/[document]`.
 *
 * Se pasan business y document juntos porque el template efectivo es
 * `document.template ?? business.template`: resolver eso necesita los dos, y
 * decidirlo en la vista obligaría a volver a leer disco o a adivinar.
 */
export function enumerateDocumentRoutes(): {
  params: { business: string; document: string };
  props: { slug: string; documentSlug: string; business: Business; document: Document };
}[] {
  return listBusinessSlugs().flatMap((businessSlug) =>
    listDocumentSlugs(businessSlug).map((documentSlug) => ({
      params: { business: businessSlug, document: documentSlug },
      props: {
        slug: businessSlug,
        documentSlug,
        business: readJson<Business>(path.join(DATA_DIR, businessSlug, 'business.json')),
        document: readJson<Document>(
          path.join(DATA_DIR, businessSlug, documentSlug, 'document.json'),
        ),
      },
    })),
  );
}