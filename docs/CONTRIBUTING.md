# Contribuir a Atrio

Guía corta para configurar el proyecto y mandar tu primer PR.

## Configurar el proyecto

Requisitos: **Node.js >= 22** y **pnpm**.

```bash
git clone <url-del-repo> && cd frontend
pnpm install
```

## Correr y verificar

```bash
astro dev --background   # dev server en http://localhost:4321
astro dev logs           # ver logs (stop / status para manejarlo)

# Chequeos antes de tocar código o de abrir el PR:
pnpm astro check         # tipos de todos los archivos
pnpm verify              # schemas + datos + formato (lo corre el build)
npx prettier --check .   # estilo de código (.prettierrc.json en la raíz)
```

No corras `pnpm build` para validar: el `prebuild` corre `verify` solo.

## Enviar un PR

1. Creá una rama desde `master` con nombre descriptivo: `git checkout -b fix/titulo-del-menu`.
2. Hacé cambios pequeños y commits con **conventional commits** (ej. `feat:`, `fix:`, `refactor:`, `docs:`).
3. Verificá que los tres chequeos de arriba pasen.
4. Pusheá y abrí el PR: `git push -u origin <rama>` y `gh pr create --fill`.
5. En la descripción contá qué cambia, por qué y cómo se probó. Referenciá las guías si tocan datos:
   - Estructura y datos → [`docs/add_business.md`](./add_business.md)
   - Sistema de diseño → [`DESIGN.md`](../DESIGN.md)

La CI (Vercel) corre el build sobre tu PR: si falla, mirá los logs antes de pedir review.
