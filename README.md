# Atrio

Catálogos y menús digitales para comercios locales. Sin cuentas, sin cookies, a máxima velocidad.

Atrio es una plataforma de perfiles digitales hecha por **ROOT studio**: cada comercio tiene una página con sus menús/cartas, y el visitante hojea las páginas como un folleto, con acción directa a WhatsApp, Instagram o llamada. Todo es **contenido estático declarado en JSON** y servido por CDN: sin base de datos, sin login, sin tracking.

## Arquitectura en dos zonas

El contenido vive en dos lugares que se complementan:

```
src/data/<slug>/                 → JSON: describen el negocio y sus menús
├── business.json                → perfil del negocio (schemas/businesses.json)
└── <menu>/document.json         → un menú y sus páginas (schemas/documents.json)

public/business/<slug>/<menu>/   → imágenes de las páginas, servidas tal cual
    ├── 01.webp
    └── ...
```

Los JSON referencian las imágenes como URLs públicas absolutas (`/business/<slug>/<menu>/01.webp`). En `build`, Astro genera una página por negocio y por menú a partir de ese JSON; el `prebuild` corre la verificación automáticamente.

## Guías

- [Cómo agregar un negocio](./docs/add_business.md) — estructura de carpetas y reglas para publicar un negocio nuevo.

## Estructura del repo

| Ruta | Qué es |
| --- | --- |
| `src/data/` | Datos declarativos de cada negocio (business + menús) |
| `public/business/` | Imágenes de páginas y activos |
| `src/pages/` | Rutas del sitio (perfil de negocio, menú, páginas legales) |
| `src/templates/` | Plantillas de presentación. `pastel-link-hub` es la única implementada; `editorial`, `grid`, `gallery` son stubs |
| `src/lib/` | Lógica: carga de datos, resolución de templates y estilos |
| `schemas/` | JSON Schema que validan los datos |
| `scripts/` | Verificación de schemas y de datos (`npm run verify`) |

## Requisitos

- Node.js >= 22
- pnpm

## Comandos

| Comando | Acción |
| --- | --- |
| `pnpm install` | Instala dependencias |
| `pnpm dev` | Servidor de desarrollo en `http://localhost:4321` |
| `astro dev --background` | Dev server en background (`astro dev stop` / `status` / `logs` para manejarlo) |
| `pnpm verify` | Valida schemas + datos + formato (lo corre el build automáticamente) |
| `pnpm build` | Build de producción a `./dist/` |
| `pnpm preview` | Previsualiza el build local |

Con `pnpm dev`, cada negocio vive en `http://localhost:4321/<slug>` y cada menú en `http://localhost:4321/<slug>/<menu>`.

## Stack

- **Astro** + **Tailwind CSS 4** + **TypeScript**
- **Svelte** para el flipbook de páginas del menú
- Verificación de datos con **JSON Schema (Ajv)** + Prettier
- Deploy estático (Vercel)