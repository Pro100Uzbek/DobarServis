# Архитектурный план проекта DobarServis (Astro + Vanilla JS + Tailwind)

## Концепция проекта (Вводные для AI-ассистента)
- **Цель:** Превратить статический сайт `dobarservis.com` в быстрый SEO-комбайн (Programmatic SEO + Мультиязычность).
- **Стек:** Astro (SSG), Tailwind CSS, Vanilla JS. Строго **без** клиентских фреймворков (React/Vue/Svelte).
- **Структура контента:** 3 языка (`sr-ME` [основной, в корне], `en`, `ru`), 3 базовые услуги (Kućni aparati, HoReCa, Održavanje vila), 9+ городов побережья и Подгорица.
- **Главный принцип:** DRY (Don't Repeat Yourself). Все данные берутся из JSON-словарей, все мета-теги и Schema.org генерируются программно, интерфейс собирается из Astro-компонентов.

---

## Фаза 1. Базовый каркас Astro и перенос HTML (Дни 1-2)
**Цель:** Развернуть проект, настроить компоненты и убрать дублирование кода.

1. **Инициализация:** `npm create astro@latest` (выбрать пустой шаблон "Empty").
2. **Разделение на компоненты:** В папке `src/components/` создать:
   - `Header.astro`
   - `Footer.astro`
   - `Modal.astro` (внедрить базовую доступность: `role="dialog"`, `aria-modal="true"`).
3. **Создание базового шаблона (`src/layouts/Layout.astro`):**
   - Перенести туда `<html>`, `<head>`, GTM (в `<head>`), `<noscript>` (сразу после `<body>`).
   - Настроить слоты (`<slot />`) для вставки контента.
   - Исправить баги текущего продакшна: поставить правильные favicon (`/favicon.ico` и `/assets/favicon.svg`), убрать битые ссылки на `index.html`.
4. **Перенос страниц:** Создать базовые страницы в `src/pages/` (`index.astro`, `kucni-aparati.astro`, `horeca.astro`, `kontakt.astro`) и обернуть их в `<Layout>`.

## Фаза 2. Интеграция Tailwind и оптимизация ассетов (Дни 3-4)
**Цель:** Убрать Tailwind CDN, настроить сборку CSS и оптимизировать шрифты/картинки (Зеленая зона CWV).

1. **Tailwind:** Установить интеграцию `npx astro add tailwind`. Astro сам настроит сборку минифицированного CSS.
2. **Локализация шрифтов:**
   - Скачать Google Fonts в `.woff2` в папку `public/fonts/`.
   - Подключить их через `@font-face` в `src/styles/global.css`.
3. **Иконки:** Убрать внешний запрос к `unpkg.com` (Lucide). Использовать Astro-интеграцию `astro-icon` или инлайн SVG в компонентах.
4. **Оптимизация LCP (Hero Image):**
   - Использовать встроенный `<Image />` из `astro:assets` для главного баннера (`TehnicarDS.webp`).
   - Задать `loading="eager"` и `fetchpriority="high"`.

## Фаза 3. Дата-слой (JSON) и Мультиязычность (Дни 5-7)
**Цель:** Подготовить данные для генерации страниц и настроить URL `[lang]`.

1. **Создание словарей (`src/data/`):**
   - `i18n.json`: переводы интерфейса (кнопки, меню, футер).
   - `services.json`: данные об услугах (slug, title, description, H1).
   - `cities.json`: список городов с локальными данными (названия, координаты для Schema).
2. **Динамическая маршрутизация языков:**
   - Корень `src/pages/` отдать под `sr-ME` (наш дефолт).
   - Создать папку `src/pages/[lang]/` для генерации `/en/` и `/ru/`.
   - Использовать `export function getStaticPaths()` для маппинга страниц из JSON.
3. **SEO-метатеги и Hreflang:**
   - В `Layout.astro` передавать текущий язык (`currentLang`).
   - Генерировать блок `<link rel="alternate" hreflang="..." />` для `sr-ME`, `en`, `ru` и `x-default`.

## Фаза 4. Programmatic SEO (Матрица Услуга × Город) (Дни 8-10)
**Цель:** Автоматическая генерация посадочных страниц под низкочастотные запросы.

1. **Шаблон услуги в городе:** 
   - Создать файл роутинга: `src/pages/[lang]/[service]/[city].astro` (и аналог в корне для `sr-ME`: `src/pages/[service]/[city].astro`).
2. **Генерация путей (getStaticPaths):**
   - Написать логику перемножения: массив языков × массив услуг × массив городов. 
   - Сгенерировать уникальные Title, H1 и контентные блоки (например: "Ремонт холодильников в Будве", "Popravka frižidera u Budvi").
3. **Перелинковка (Siloing):**
   - Создать компонент `<CityLinks service={currentService} lang={currentLang} />`, который выводит ссылки на эту же услугу в других городах.

## Фаза 5. Сквозная логика JS и Schema.org (Дни 11-13)
**Цель:** Привязать модалку к контексту страницы и добавить графовую микроразметку.

1. **Ванильный JS для модалок:**
   - В `Layout.astro` добавить `data-lang={lang}` и `data-city={city}` в тег `<body>` или `<html>`.
   - В `Modal.astro` написать `<script>`, который при клике читает эти `dataset` атрибуты и формирует правильную ссылку: `https://wa.dobarservis.com/?service=...&lang=...&city=...`.
2. **JSON-LD Schema.org:**
   - Создать компонент `<SeoSchema />`.
   - Внедрить динамический `LocalBusiness` (подтягивать `areaServed` из `cities.json`), `Service` (из `services.json`) и `BreadcrumbList`.
   - Разместить компонент в `<head>`.

## Фаза 6. Финализация и Деплой (День 14)
**Цель:** Карта сайта, проверка на битые ссылки и релиз.

1. **Sitemap:** 
   - Установить `@astrojs/sitemap`.
   - Настроить кастомную генерацию `sitemap.xml`, чтобы она учитывала `hreflang` (Astro sitemap integration умеет это делать через `i18n` конфигурацию).
2. **Редиректы:** Настроить 301 редиректы со старых `.html` на новые чистые URL в файле конфигурации хостинга (например, `_redirects` для Cloudflare/Netlify или `netlify.toml`).
3. **Проверка WAF:** Убедиться, что хостинг не блокирует отдачу `robots.txt` и `sitemap.xml`.