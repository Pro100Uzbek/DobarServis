export interface AlternateLink {
	hreflang: string;
	href: string;
}

export interface SeoConfig {
	title: string;
	description: string;
	canonical: string;
	lang: 'sr-ME' | 'en' | 'ru';
	city?: string;
	service?: 'general' | 'urgent' | 'home' | 'horeca' | 'facility';
	ogImage?: string;
	noindex?: boolean;
	alternates?: AlternateLink[];
	breadcrumbs?: { name: string; url: string }[];
	schema?: Record<string, unknown> | Record<string, unknown>[];
	isContactPage?: boolean;
	translated?: boolean;
}

export type BuildSeoConfigInput = Omit<SeoConfig, 'canonical'> & {
	path: string;
};

const SITE_ORIGIN = 'https://dobarservis.com';

const HREFLANG_MAP: Record<string, string> = {
	'sr-ME': 'sr',
	'sr-me': 'sr',
	en: 'en',
	ru: 'ru',
};

export function toHreflang(locale: string): string {
	return HREFLANG_MAP[locale] ?? locale;
}

function normalizeSiteUrl(path: string): string {
	const parsedUrl = new URL(path, `${SITE_ORIGIN}/`);
	const normalizedPath =
		parsedUrl.pathname.endsWith('/') ? parsedUrl.pathname : `${parsedUrl.pathname}/`;

	return `${SITE_ORIGIN}${normalizedPath}`;
}

export function buildSeoConfig({
	path,
	city = 'Crna Gora',
	alternates,
	...config
}: BuildSeoConfigInput): SeoConfig {
	const normalizedAlternates = alternates
		? alternates.map((alternate) => ({
				...alternate,
				hreflang: toHreflang(alternate.hreflang),
			}))
		: undefined;
	const canonical = normalizeSiteUrl(path);

	if (normalizedAlternates) {
		const defaultAlternate =
			normalizedAlternates.find((alternate) => alternate.hreflang === 'sr') ??
			normalizedAlternates.find((alternate) => alternate.hreflang !== 'x-default');
		const hasXDefault = normalizedAlternates.some(
			(alternate) => alternate.hreflang.toLowerCase() === 'x-default',
		);
		if (!hasXDefault) {
			normalizedAlternates.push({
				hreflang: 'x-default',
				href: defaultAlternate ? normalizeSiteUrl(defaultAlternate.href) : canonical,
			});
		}
	}

	return {
		...config,
		ogImage: config.ogImage ?? '/TehnicarDS.webp',
		canonical,
		city,
		...(normalizedAlternates ? { alternates: normalizedAlternates } : {}),
	};
}
