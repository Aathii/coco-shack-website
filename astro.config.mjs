// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// Set GITHUB_PAGES=true only to build for the bare aathii.github.io/coco-shack-website/ subpath.
// Production (GitHub Pages on thecocoshack.ca) serves from the root and leaves it unset.
const onGitHubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  site: onGitHubPages ? 'https://aathii.github.io' : 'https://thecocoshack.ca',
  // Trailing slash matters: BASE_URL is used verbatim (e.g. `${BASE_URL}favicon.ico`)
  // wherever a path can't go through Astro's own base-aware routing/asset helpers.
  base: onGitHubPages ? '/coco-shack-website/' : '/',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});