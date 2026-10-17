<script>
import { onMount } from 'svelte';
import { PageFlip } from 'page-flip';
let { images = [] } = $props();

    const canFlip = $derived(images.length >= 2);

    let bookElement = $state(null);
    let flip = $state(null);
    let current = $state(0);
    let total = $state(0);
    /** El canvas ya tiene tamaño y el libro se puede ver. Antes hay loader. */
    let ready = $state(false);
    onMount(() => {
        if (!canFlip || !bookElement) return;

        flip = new PageFlip(bookElement, {

            width: 400,
            height: 556,
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
            current = e.data;
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

        /**
         * El loader cubre sólo el hueco que page-flip no cubre.
         *
         * El canvas arranca en 0×0: la librería le da la proporción recién
         * cuando calcula la geometría en su primer `update()`. Antes de eso no
         * hay libro, y como el componente es `client:only` tampoco hay nada en
         * el HTML del server — la página abre con un hueco y el libro aparece
         * de golpe.
         *
         * No hace falta esperar a las imágenes: para eso page-flip ya dibuja
         * su propio spinner en el canvas mientras `isLoad` es false. Ese
         * spinner toma el relevo apenas el canvas tiene tamaño, que es
         * exactamente la condición que se chequea acá.
         */
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
</script>

{#if canFlip}

<div class="relative flex flex-col items-center justify-center w-full">

        <div bind:this={bookElement} class="max-w-full my-5"></div>

        <!--
          Loader superpuesto, NO en el flujo. Si ocupara altura Sumada al
          libro, al desaparecer saltaría el layout justo cuando ya lo estás
          mirando. Va en `inset-0` con `pointer-events-none` para no tocar la
          mecánica de tamaños de page-flip, que es delicada: la proporción la
          calcula la librería con un `padding-bottom` en su wrapper interno.

          Tres marcas que se encienden en cascada, no un spinner genérico:
          es el mismo lenguaje que el contador de abajo. Una hoja de menú
          entra detrás de otra.
        -->
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
        
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none w-[calc(100%+3.5rem)] sm:w-[calc(100%+5rem)] px-2">
            <button
                type="button"
                onclick={() => flip?.flipPrev('top')}
                disabled={!ready || current === 0}
                aria-label="Página anterior"
                class="grid size-11 pointer-events-auto place-items-center rounded-pastel-full border border-border bg-surface text-black transition disabled:opacity-35 shadow-sm"
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
                class="grid size-11 pointer-events-auto place-items-center rounded-pastel-full border border-border bg-surface text-black transition disabled:opacity-35 shadow-sm"
            >
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"
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