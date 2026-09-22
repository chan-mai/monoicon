import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@nuxt/icon', '@nuxt/fonts', '@nuxt/scripts'],
	$production: {
		scripts: {
			registry: {
				googleAnalytics: {
					id: 'G-2Q3WL18CQZ',
					trigger: 'onNuxtReady',
				},
			},
		},
	},
	css: ['~/assets/css/main.css'],
	vite: {
		plugins: [tailwindcss()],
	},
	routeRules: {
		'/docs': { redirect: '/docs/api/v2' },
	},
	nitro: {
		preset: 'cloudflare_module',
		experimental: { wasm: true },
	},
	fonts: {
		families: [
			{ name: 'LINE Seed JP', provider: 'google', weights: [400, 700, 800] },
			{ name: 'Righteous', provider: 'google', weights: [400] },
			{
				name: 'M PLUS Rounded 1c',
				provider: 'google',
				weights: [400, 500, 700],
			},
		],
	},
	app: {
		head: {
			htmlAttrs: { lang: 'ja' },
			title: 'monoicon',
			meta: [
				{ name: 'description', content: 'A simple generator for monochrome icons.' },
				{ property: 'og:type', content: 'website' },
				{ property: 'og:site_name', content: 'monoicon' },
				{ property: 'og:title', content: 'monoicon' },
				{ property: 'og:description', content: 'A simple generator for monochrome icons.' },
				{ property: 'og:url', content: 'https://monoicon.mq1.dev' },
				{ property: 'og:image', content: 'https://monoicon.mq1.dev/img/logo.png' },
				{ name: 'twitter:card', content: 'summary' },
			],
			link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
		},
	},
});
