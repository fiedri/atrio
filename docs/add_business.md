# Agregar un negocio

Hay **dos zonas**: los JSON de datos viven en `src/data/`, y las imágenes se sirven desde `public/`. Un slug es el nombre de la carpeta: minúsculas y guiones (`lo-de-pepe`, no "Lo De Pepe").

```
src/data/<slug>/                 → JSON, describen el negocio y sus menús
├── business.json                → schema: schemas/businesses.json
└── <menu>/
    └── document.json            → schema: schemas/documents.json

public/business/<slug>/<menu>/   → imágenes de las páginas, se sirven tal cual
    ├── 01.webp
    ├── 02.webp
    └── ...
```

## Reglas

- **business.json** obligatorio en `src/data/<slug>/`; **document.json** obligatorio en cada `src/data/<slug>/<menu>/`. Sin esos archivos, la carpeta no se detecta.
- **Las imágenes SIEMPRE en `public/`**, nunca en `src/data/`. Las páginas del menú van en `public/business/<slug>/<menu>/`, aplanadas (sin subcarpeta interna), y en `document.json` se referencian como **URL pública absoluta**: `"/business/<slug>/<menu>/01.webp"`. El orden en la lista de `pages` ES el orden de lectura.
- **Pad de dos dígitos** (`01`, `02`, … `10`) en los `.webp`: mantiene el orden correcto si algún día se ordena alfabéticamente. Solo `.webp`.
- El logo también es una URL pública absoluta (ej: `"/business/<slug>/logo.webp"`), cualquier archivo en `public/` sirve.
- El resto (campos, `template`, `styles`) seguí los schemas: cada campo entera cuál es su rol y qué es opcional.

## Campos que importan

- `template`: la única implementada es `"pastel-link-hub"`. `editorial`, `grid` y `gallery` son stubs y **rompen el build** si un JSON publicado los usa.
- `status`: `"published"` para que se vea; `draft`/`archived` quedan ocultos.
- `isActive: false` oculta el negocio y todos sus menús sin borrar nada.
- `showProfile: false` genera los menús pero no la página del negocio (para quien solo quiere publicar su carta).
- `order` en los menús controla la posición de cada uno en la página del negocio; sin él van al final en orden alfabético.

## Verificar

El build corre la verificación automáticamente (`npm run build` → `prebuild`). Para chequear sin buildear:

```sh
pnpm run verify
```

Valida los JSON contra los schemas, que estén formateados con Prettier, y que cada URL de `pages` apunte a un `.webp` que exista en `public/` (con el mismo pad). Si algo falla, te dice exactamente qué y dónde. Con el dev server corriendo (`astro dev --background`), entrás a `http://localhost:4321/<tu-slug>`.
