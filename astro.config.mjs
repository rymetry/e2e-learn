import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://e2e-learn.rymetry.workers.dev',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    // expressiveCode は mdx より前に配置しないと MDX 内コードブロックに適用されない
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      useDarkModeMediaQuery: false,
      themeCssRoot: 'html',
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
    }),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
