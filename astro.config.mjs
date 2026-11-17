// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://dobarservis.com',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'sr-ME',
    locales: ['sr-ME', 'en', 'ru'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/privacy/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
