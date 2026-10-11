import fs from 'node:fs';
import path from 'node:path';
import type { Business } from './business';
import type { Document } from './document';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

export function listBusinessSlugs(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(DATA_DIR, slug, 'business.json')))
    .sort();
}

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


function isPublic(doc: Document): boolean {
  return doc.status === 'published';
}

function isActive(business: Business): boolean {
  return business.isActive !== false;
}


export function listDocuments(businessSlug: string): DocumentSummary[] {
  return listDocumentSlugs(businessSlug)
    .map((slug) => ({ slug, doc: readDocument(businessSlug, slug) }))

    .filter(({ doc }) => isPublic(doc))
    .map(({ slug, doc }) => summarize(slug, doc))
    .sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
        a.slug.localeCompare(b.slug),
    );
}

export function enumerateBusinessRoutes(): {
  params: { business: string };
  props: { slug: string; business: Business; documents: DocumentSummary[] };
}[] {
  return listBusinessSlugs()
    .map((slug) => ({
      slug,
      business: readJson<Business>(path.join(DATA_DIR, slug, 'business.json')),
    }))

    .filter(({ business }) => isActive(business) && business.showProfile !== false)
    .map(({ slug, business }) => ({
      params: { business: slug },
      props: { slug, business, documents: listDocuments(slug) },
    }));
}


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
