<script>
import { onMount } from 'svelte';
import { PageFlip } from 'page-flip';
let { images = [], imgWidth =400, imgHeight=556 } = $props();

    const canFlip = $derived(images.length >= 2);

    let bookElement = $state(null);
    let zoomWrap = $state(null);
    let flip = $state(null);
    let current = $state(0);
    let total = $state(0);
    let ready = $state(false);

    /**
     * Zoom del libro.
     *
     * page-flip saca su tamaño del contenedor (`getBlockWidth()`, en
     * calculateBoundsRect) y lo recalcula en cada `ui.update()`. No hay
     * `setSettings()` en la librería, así que el zoom no es un ajuste de page-flip:
     * es el ancho de `zoomWrap`.
     *
     * El techo es 1.4 por el modo landscape de page-flip: cuando el bloque pasa
     * `2 * minWidth` (315 * 2 = 630px) la librería voltea a dos páginas
     * horizontales y deja de ser un zoom para ser otro modo de lectura. El
     * contenedor base mide 432px, así que 1.4 da 605px, debajo del umbral.
     */
    const ZOOM_MIN = 1;
    const ZOOM_MAX = 1.4;
    const ZOOM_STEP = 0.2;

    let zoom = $state(ZOOM_MIN);

    /**
     * El ancho se escribe imperativamente y el `update()` va enseguida porque
     * leer `offsetWidth` dentro de page-flip fuerza el reflow pendiente: si se
     * separaran con un rAF, mediría el ancho viejo.
     */
    function applyZoom() {
        if (!zoomWrap || !flip) return;
        zoomWrap.style.width = `${zoom * 100}%`;
        flip.getUI().update();
    }

    function stepZoom(delta) {
        const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(zoom + delta).toFixed(2)));
        if (next === zoom) return;
        zoom = next;
        applyZoom();
    }

    /**
     * Pincha.
     *
     * page-flip escucha los toques para voltear páginas, así que un pinche sin
     * blindaje termina cambiando la página en vez de hacer zoom. Por eso
     * mientras hay dos dedos el libro queda con `pointer-events: none` y la
     * librería literalmente no recibe los eventos.
     *
     * `pinch.start` congela el zoom con el que empezó el gesto: si se comparara
     * contra el zoom vivo, mover los dedos de vuelta lo dejaría trabado.
     */
    let pinch = null;

    function touchDistance(touches) {
        const [a, b] = touches;
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    function onTouchStart(e) {
        if (e.touches.length !== 2) return;
        const start = touchDistance(e.touches);
        if (!start) return;
        pinch = { start, zoom };
        if (bookElement) bookElement.style.pointerEvents = 'none';
    }

    function onTouchMove(e) {
        if (!pinch || e.touches.length !== 2) return;
        // Sin esto el browser hace su propio pinch-zoom sobre el viewport y
        // pelea con el nuestro.
        e.preventDefault();
        const dist = touchDistance(e.touches);
        if (!dist) return;
        zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(pinch.zoom * (dist / pinch.start)).toFixed(2)));
        applyZoom();
    }

    function onTouchEnd(e) {
        if (e.touches.length >= 2) return;
        pinch = null;
        if (bookElement) bookElement.style.pointerEvents = '';
    }

    onMount(() => {
        if (!canFlip || !bookElement) return;

        flip = new PageFlip(bookElement, {

            width: imgWidth,
            height: imgHeight,
            size: 'stretch',
            minWidth: 315,
            maxWidth: 1600,
            minHeight: 420,
            maxHeight: 2400,
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: true,
        });

        flip.on('init', (e) => {
            total = e.object.getPageCount();
            current = e.data.page;
        });
        flip.on('flip', (e) => {
            current = e.data;
        });

        flip.loadFromImages(images);


        const ui = flip.getUI();
        const canvas = ui.getCanvas();
        const originalResize = ui.resizeCanvas.bind(ui);

        ui.resizeCanvas = function () {
            originalResize();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (dpr === 1) return;
            const w = canvas.width;
            const h = canvas.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;

            canvas.getContext('2d').scale(dpr, dpr);
        };
        ui.update();

        let rafId;
        const waitForCanvas = () => {
            if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
                ready = true;
                return;
            }
            rafId = requestAnimationFrame(waitForCanvas);
        };
        rafId = requestAnimationFrame(waitForCanvas);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            flip.destroy();
        };
    });
    $inspect(ready, current)
</script>

{#if canFlip}

<div class="relative flex flex-col items-center justify-center w-full">

        <div
            bind:this={zoomWrap}
            class="w-full overflow-x-auto touch-pan-y"
            style="width: {zoom * 100}%"
            ontouchstart={onTouchStart}
            ontouchmove={onTouchMove}
            ontouchend={onTouchEnd}
            ontouchcancel={onTouchEnd}
        >
            <div bind:this={bookElement} class="max-w-full my-5"></div>
        </div>

        {#if !ready}
            <div
                class="absolute inset-0 grid place-items-center pointer-events-none"
                role="status"
                aria-label="Cargando el menú"
            >
                <div class="flex items-center gap-pastel-xs" aria-hidden="true">
                    {#each [0, 1, 2] as i (i)}
                        <span
                            class="h-1 w-1.5 rounded-pastel-full bg-border animate-pulse motion-reduce:animate-none"
                            style="animation-delay: {i * 180}ms"
                        ></span>
                    {/each}
                </div>
            </div>
        {/if}
        

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none w-[calc(100%+4rem)] px-1.5">
            <button
                type="button"
                onclick={() => flip?.flipPrev('top')}
                disabled={current === 0}
                aria-label="Página anterior"
                class="pointer-events-auto grid size-10 place-items-center rounded-pastel-full border border-border/70 bg-glass/75 text-ink shadow-pastel-2 backdrop-blur-glass backdrop-saturate-150 transition active:scale-95 disabled:opacity-30 motion-reduce:transition-none"
            >
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"
                    aria-hidden="true">
                    <path d="M15 4l-8 8 8 8" />
                </svg>
            </button>

            <button
                type="button"
                onclick={() => flip?.flipNext('top')}
                disabled={!ready || current === total - 1}
                aria-label="Página siguiente"
                class="pointer-events-auto grid size-10 place-items-center rounded-pastel-full border border-border/70 bg-glass/75 text-ink shadow-pastel-2 backdrop-blur-glass backdrop-saturate-150 transition active:scale-95 disabled:opacity-30 motion-reduce:transition-none"
            >
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"
                    aria-hidden="true">
                    <path d="M9 4l8 8-8 8" />
                </svg>
            </button>
        </div>


        <div class="mt-auto flex min-h-5 items-center justify-center gap-pastel-xs" aria-live="polite">
            {#if !ready}
                <span class="sr-only">Cargando el menú</span>
            {:else if total > 2 && total <= 8}
                {#each Array.from({ length: total }, (_, i) => i) as i (i)}
                    <span
                        class="h-1 rounded-pastel-full transition-all duration-200 {i === current
                            ? 'w-5 bg-accent'
                            : 'w-1.5 bg-border'}"
                    ></span>
                {/each}
                <span class="sr-only">Página {current + 1} de {total}</span>
            {:else}
                <span class="text-sm tabular-nums text-muted">
                    {typeof current === 'number' ? current + 1 : 1} / {total}
                </span>
            {/if}
        </div>

        <div class="flex items-center justify-center gap-pastel-sm">
            <button
                type="button"
                onclick={() => stepZoom(-ZOOM_STEP)}
                disabled={!ready || zoom <= ZOOM_MIN}
                aria-label="Alejar"
                class="grid size-9 pointer-events-auto place-items-center rounded-pastel-full border border-border bg-surface text-black transition disabled:opacity-35 shadow-sm"
            >
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"
                    aria-hidden="true">
                    <path d="M5 12h14" />
                </svg>
            </button>

            <span class="min-w-11 text-center text-xs tabular-nums text-muted">
                {Math.round(zoom * 100)}%
            </span>

            <button
                type="button"
                onclick={() => stepZoom(ZOOM_STEP)}
                disabled={!ready || zoom >= ZOOM_MAX}
                aria-label="Acercar"
                class="grid size-9 pointer-events-auto place-items-center rounded-pastel-full border border-border bg-surface text-black transition disabled:opacity-35 shadow-sm"
            >
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"
                    aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </button>
        </div>
    </div>
{:else}

    <ul class="my-8 flex flex-col gap-pastel-lg">
        {#each images as src (src)}
            <li>
                <img
                    {src}
                    alt=""
                    loading="lazy"
                    class="w-full rounded-pastel-lg border border-border bg-surface shadow-pastel-1"
                />
            </li>
        {/each}
    </ul>
{/if}