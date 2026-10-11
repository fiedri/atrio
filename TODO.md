# TODO

## Fondo de imagen (`background.image`) — no implementado, no es un bug

**Estado:** la plumbing existe completa y el feature no. No hay nada roto.

La cadena today llega hasta el final y se corta en el último salto:

```
business.json  styles.background.image
  → getBusinessStyles()            src/lib/styles.ts:91   emite --backdrop
  → @theme inline                  src/styles/global.css:132   mapea a --backdrop-image
  → @utility backdrop              src/styles/global.css:148   define la clase
  → ???                            ningún componente la aplica   ← acá muere
```

`--backdrop` viaja al `<html>` de cada página de negocio, pero ninguna vista
aplica la clase `backdrop`, así que una imagen configurada en el JSON no se ve
en ningún lado.

Los fondos que **sí** renderizan pasan por otro camino: las vistas usan
`getBusinessBackground()` y dibujan un elemento `<video>` real
(`BusinessView.astro:29-41`, `DocumentView.astro:30-42`). Ese camino funciona
y es independiente de `background.image`.

### Para implementarlo

1. Aplicar la utility donde corresponda — `<html>` en `Layout.astro`, o
   `<main>` en cada vista. `backdrop` ya trae `background-size: cover`,
   `position: center` y `no-repeat`.
2. Ojo con el orden de pintado: `<main>` lleva `bg-background`, que resuelve a
   un color **opaco**. Si el fondo va en `<main>`, el `background-image` de la
   utility queda tapado por su propio `background-color`. Hay que decidir
   cuál de los dos manda.
3. Decidir si `background.video`/`videoPoster` convergen a esta misma utility o
   siguen siendo un camino aparte. Hoy son dos mecanismos para lo mismo.

### Nota aparte

`styles.background.image` se interpola crudo en `url('${…}')`
(`src/lib/styles.ts:91`) y el schema lo declara como `{"type":"string"}` sin
pattern. Cuando se implemente esto, conviene agregarle un pattern al schema
en el mismo cambio — si no, un valor con `'); }` inyecta CSS.