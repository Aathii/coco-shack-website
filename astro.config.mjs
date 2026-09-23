// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: confirm the real production domain before launch (the client's own
  // event signage points to thecocoshack.ca, used here as a placeholder).
  site: 'https://thecocoshack.ca',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});