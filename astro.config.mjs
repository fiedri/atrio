// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  integrations: [
    svelte(),
    icon({
      include: {
        "akar-icons": ["instagram-fill", "whatsapp-fill"],
        arcticons: ["tripadvisor"],
        mdi: ["silverware-fork-knife", "glass-cocktail", "bowl-mix"],
        "simple-icons": [],
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
