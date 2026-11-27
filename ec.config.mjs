import { defineEcConfig } from 'astro-expressive-code';

export default defineEcConfig({
  themes: ['github-light', 'github-dark'],
  useDarkModeMediaQuery: false,
  themeCssRoot: 'html',
  themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
});
