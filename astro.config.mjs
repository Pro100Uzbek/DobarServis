// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = process.env.SITE_URL || 'https://dobarservis.com';
const DEFAULT_LOCALE = 'sr-ME';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: ['sr-ME', 'en', 'ru'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
      fallbackType: 'rewrite',
    },
    fallback: {
      en: 'sr-ME',
      ru: 'sr-ME',
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: {
          'sr-ME': 'sr',
          en: 'en',
          ru: 'ru',
        },
      },
      filter: (page) => !/\/404\/?$/.test(page),
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        if (pathname === '/') {
          item.priority = 1.0;
        } else if (/^\/privacy\/?$/.test(pathname)) {
          item.priority = 0.3;
        } else {
          item.priority = 0.8;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: 'lightningcss' },
  },
});
