// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// Set only by the GitHub Pages workflow (.github/workflows/deploy.yml), which serves the
// site from a /coco-shack-website/ subpath. Leave unset for the real domain (root path) —
// production deploys (Cloudflare Pages etc.) never set this.
const onGitHubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  // TODO: confirm the real production domain before launch (the client's own
  // event signage points to thecocoshack.ca, used here as a placeholder).
  site: onGitHubPages ? 'https://aathii.github.io' : 'https://thecocoshack.ca',
  // Trailing slash matters: BASE_URL is used verbatim (e.g. `${BASE_URL}favicon.ico`)
  // wherever a path can't go through Astro's own base-aware routing/asset helpers.
  base: onGitHubPages ? '/coco-shack-website/' : '/',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});