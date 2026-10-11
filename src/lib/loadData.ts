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
function listDocumentSlugs(businessSlug: string): string[] {
  const businessDir = path.join(DATA_DIR, businessSlug);
  if (!fs.existsSync(businessDir)) return [];
  return fs
    .readdirSync(businessDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(businessDir, slug, 'document.json')))
    .sort();
}

/**
 * El `as T` de abajo es una aserción, no una validación: TypeScript confía en
 * que el JSON cumple el tipo y nunca lo contrasta. Por eso una clave que el
 * tipo prohíbe (ej. `SocialPlatform` sin `'email'`) no produce ningún
 * diagnóstico.
 *
 * La red real es el gate de build: `npm run verify` valida cada archivo contra
 * `schemas/*.json` con ajv y `prebuild` corre antes de `astro build`. Un JSON
 * que no valida rompe el build, no la página.
 *
 * Lo que sí hace esta función es no dejar que un JSON mal formado se presente
 * como un error de tipo más adelante, sin decir qué archivo lo provocó.
 */
function readJson<T>(file: string): T {
  let raw: string;
  try {
    raw = fs.readFileSync(file, 'utf-8');
  } catch {
    throw new Error(`No se pudo leer el JSON de datos: ${file}`);
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`JSON mal formado en ${file}: ${(error as Error).message}`);
  }
}

function readDocument(businessSlug: string, documentSlug: string): Document {
  return readJson<Document>(
    path.join(DATA_DIR, businessSlug, documentSlug, 'document.json'),
  );
}

/**
 * ¿Este menú se publica?
 *
 * El schema ya definía el contrato y nadie lo implementaba:
 *
 *   "draft: no se muestra. published: visible al público. archived: oculto
 *    pero conservado."
 *
 * O sea que la regla es UNA sola condición — `published` — y no "sacale los
 * borradores". `archived` dice "oculto" con la misma claridad que `draft`, y
 * dejarlo público sería el mismo bug con otro nombre: un menú que el comercio
 * retiró, seguir en la calle.
 *
 * Va acá y no en la vista porque este filtro tiene que actuar en DOS lugares:
 * las rutas que se generan y las tarjetas que las enumeran. Filtrar sólo uno
 * deja o un link a un 404 o una tarjeta a una página que no existe.
 */
function isPublic(doc: Document): boolean {
  return doc.status === 'published';
}

function isActive(business: Business): boolean {
  return business.isActive !== false;
}

/**
 * Los menús de un negocio, ya resumidos y en el orden en que se muestran.
 *
 * `listDocumentSlugs` ordena alfabéticamente, y para un restaurante eso es
 * exactamente el orden equivocado: la carta se llama `carta`, las bebidas
 * `bebidas`, así que la carta —el menú por el que vinieron— caía en la
 * posición 2 de 3. Nadie lo va a reportar y todos lo notan.
 *
 * Por eso el resumen se ordena con `order` del document.json. Los que no lo
 * declaran van último, en alfabético: el orden explícito manda, y el que no
 * declara nada sigue siendo estable y predecible.
 */
export function listDocuments(businessSlug: string): DocumentSummary[] {
  return listDocumentSlugs(businessSlug)
    .map((slug) => ({ slug, doc: readDocument(businessSlug, slug) }))
    // Sólo los públicos llegan a la tarjeta. Si un borrador se listara y su
    // ruta no existiera, cada tarjeta sería un 404 esperando que alguien la
    // toque.
    .filter(({ doc }) => isPublic(doc))
    .map(({ slug, doc }) => summarize(slug, doc))
    .sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
        a.slug.localeCompare(b.slug),
    );
}

/**
 * Rutas de `/[business]`.
 *
 * `slug` viene en las props además del `params` porque la vista del template
 * necesita armar los href a los menús y el nombre del negocio no es el slug.
 * `documents` también: son el contenido de la página, no un detalle del loader.
 */
export function enumerateBusinessRoutes(): {
  params: { business: string };
  props: { slug: string; business: Business; documents: DocumentSummary[] };
}[] {
  return listBusinessSlugs()
    .map((slug) => ({
      slug,
      business: readJson<Business>(path.join(DATA_DIR, slug, 'business.json')),
    }))
    // `showProfile: false` = "sólo quiero publicar mi carta". Los menús se
    // generan igual; lo que no existe es `/<slug>`.
    //
    // Filtrar acá y no en la vista es lo que hace que la ausencia sea REAL:
    // no hay página a la que linkear, y los menús consultan la misma bandera
    // para no ofrecer un link de vuelta a algo que no existe.
    //
    // El filtro es sobre las RUTAS del perfil. Los menús de un negocio sin
    // perfil se siguen enumerando en `enumerateDocumentRoutes`.
    .filter(({ business }) => isActive(business) && business.showProfile !== false)
    .map(({ slug, business }) => ({
      params: { business: slug },
      props: { slug, business, documents: listDocuments(slug) },
    }));
}

/**
 * Lo que la página del negocio necesita saber de cada menú para poder dibujarlo.
 *
 * Antes esta vista recibía `string[]` con los slugs pelados y armaba el título
 * con `slug.replace(/-/g, ' ').replace(/\b\w/g, toUpperCase)`. Eso es una
 * plantilla hablando: el nombre del botón era el nombre de la carpeta, y
 * cualquier menú con acento o palabra compuesta salía mal. Una tarjeta que no
 * dice qué es no se puede diseñar, así que el loader lee el document.json y
 * manda el contenido de verdad.
 */
export interface DocumentSummary {
  slug: string;
  title: string;
  description?: string;
  pageCount: number;
  icon?: string;
  background?: string;
  order?: number;
}

function summarize(slug: string, doc: Document): DocumentSummary {
  return {
    slug,
    title: doc.title,
    description: doc.description,
    pageCount: doc.pages.length,
    icon: doc.icon,
    background: doc.background,
    order: doc.order,
  };
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
  return listBusinessSlugs().flatMap((businessSlug) => {
    const business = readJson<Business>(path.join(DATA_DIR, businessSlug, 'business.json'));
    if (!isActive(business)) return [];

    return listDocumentSlugs(businessSlug)
      .map((documentSlug) => ({
        documentSlug,
        document: readDocument(businessSlug, documentSlug),
      }))
      .filter(({ document }) => isPublic(document))
      .map(({ documentSlug, document }) => ({
        params: { business: businessSlug, document: documentSlug },
        props: { slug: businessSlug, documentSlug, business, document },
      }));
  });
}