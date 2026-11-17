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
}

export type BuildSeoConfigInput = Omit<SeoConfig, 'canonical'> & {
	path: string;
};

const SITE_ORIGIN = 'https://dobarservis.com';

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
	const normalizedAlternates = alternates ? [...alternates] : undefined;
	const hasLanguageAlternates = normalizedAlternates?.some(
		(alternate) => alternate.hreflang.toLowerCase() !== 'x-default',
	);

	if (normalizedAlternates && hasLanguageAlternates) {
		const defaultLanguageAlternate = normalizedAlternates.find(
			(alternate) => alternate.hreflang.toLowerCase() === 'sr-me',
		) ?? normalizedAlternates.find(
			(alternate) => alternate.hreflang.toLowerCase() !== 'x-default',
		);
		const xDefaultAlternate = normalizedAlternates.find(
			(alternate) => alternate.hreflang.toLowerCase() === 'x-default',
		);

		if (!xDefaultAlternate && defaultLanguageAlternate) {
			normalizedAlternates.push({
				hreflang: 'x-default',
				href: normalizeSiteUrl(defaultLanguageAlternate.href),
			});
		}
	}

	return {
		...config,
		canonical: normalizeSiteUrl(path),
		city,
		...(normalizedAlternates ? { alternates: normalizedAlternates } : {}),
	};
}
