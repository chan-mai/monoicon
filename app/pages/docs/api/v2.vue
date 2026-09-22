<script setup lang="ts">
useHead({ title: 'API Docs | monoicon' });
useIntro();

const iconParams = [
	{ name: 'color', type: 'string', required: true, desc: 'CSSカラー文字列(hex, rgb(), hsl(), oklch(), lab()等)' },
	{ name: 'size', type: 'integer', required: false, desc: '1〜2048の整数。既定値は512' },
	{ name: 'format', type: 'string', required: false, desc: 'png / jpeg / webp / jxl(非推奨) / ppm(非推奨)のいずれか。既定値はpng' },
	{ name: 'download', type: 'flag', required: false, desc: '付与するとContent-Disposition: attachmentで応答' },
];

const iconErrors = [
	'Invalid color: expected a CSS color',
	'Invalid size: expected integer between 1 and 2048',
	'Invalid format: expected png, jpeg, webp, jxl or ppm',
	'Color is outside the sRGB gamut; use format=png',
];

const paletteParams = [{ name: 'gamut', type: 'string', required: false, desc: 'srgb / display-p3のいずれか。既定値はsrgb' }];

const paletteErrors = ['Invalid gamut: expected srgb or display-p3'];

const { data: palette } = await useAsyncData('docs-palette-v2', () => $fetch<PaletteResponse>('/api/v2/palette'));
const samples = computed(() => (palette.value?.colors ?? []).slice(0, 4));

const paletteExample = `{
	"colors": [
		"oklch(89.1% 0.062 14.2)", "oklch(90.4% 0.071 43.8)",
		"oklch(87.2% 0.089 61.5)", "oklch(91.0% 0.058 86.9)",
		"oklch(88.6% 0.104 152.3)", "oklch(90.1% 0.077 168.4)",
		"oklch(86.9% 0.066 214.7)", "oklch(89.7% 0.059 247.1)",
		"oklch(88.0% 0.072 291.6)", "oklch(90.8% 0.061 318.2)",
		"oklch(87.5% 0.083 337.9)", "oklch(89.3% 0.068 352.4)"
	],
	"initial": "oklch(88.6% 0.104 152.3)"
}`;
</script>

<template>
	<main class="mx-auto w-full max-w-3xl px-5 pb-24 md:px-8">
		<h1 class="mt-10 font-display text-3xl font-semibold tracking-tight md:mt-14" data-intro>API Docs</h1>
		<p class="mt-3 text-sm leading-7 text-sub" data-intro>
			単色アイコン画像を返すHTTP APIです。認証は不要です。v1 APIは
			<NuxtLink to="/docs/api/v1" class="underline decoration-line underline-offset-4 hover:text-ink">旧ドキュメント</NuxtLink>
			を参照してください。
		</p>

		<section class="mt-12" data-intro>
			<h2 class="font-mono text-lg font-semibold">GET /api/v2/icon</h2>
			<p class="mt-2 text-sm leading-7 text-sub">
				指定した1色で塗りつぶした正方形の画像をレスポンスします。色はCSSカラー文字列で指定できます。 sRGB色域外の色はDisplay
				P3のPNG(cICPチャンク付き)として出力します。この場合format=png以外は400をレスポンスします。
			</p>

			<h3 class="mt-6 text-[11px] font-medium tracking-[0.2em] text-sub">QUERY PARAMETERS</h3>
			<div class="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
				<div v-for="p in iconParams" :key="p.name" class="border-b border-line px-5 py-4 last:border-b-0">
					<div class="flex flex-wrap items-center gap-2">
						<code class="font-mono text-sm font-semibold">{{ p.name }}</code>
						<span class="text-xs text-sub">{{ p.type }}</span>
						<span class="rounded-full px-2 py-0.5 text-[10px] font-medium" :class="p.required ? 'bg-ink text-white' : 'bg-ink/5 text-sub'">
							{{ p.required ? '必須' : '任意' }}
						</span>
					</div>
					<p class="mt-1.5 text-sm text-sub">{{ p.desc }}</p>
				</div>
			</div>

			<h3 class="mt-6 text-[11px] font-medium tracking-[0.2em] text-sub">RESPONSE</h3>
			<p class="mt-2 text-sm leading-7 text-sub">
				画像バイナリ(image/png, image/jpeg, image/webp, image/jxl, image/x-portable-pixmap)をレスポンスします。<code
					class="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-xs"
					>Cache-Control: public, max-age=31536000, immutable</code
				>が付与されます。パラメータが不正な場合は400と以下のいずれかのメッセージをレスポンスします。
			</p>
			<ul class="mt-2 space-y-1">
				<li v-for="e in iconErrors" :key="e">
					<code class="font-mono text-xs text-sub">{{ e }}</code>
				</li>
			</ul>

			<h3 class="mt-6 text-[11px] font-medium tracking-[0.2em] text-sub">EXAMPLE</h3>
			<pre
				class="mt-3 overflow-x-auto rounded-2xl border border-line bg-white p-5 font-mono text-xs leading-6"
			><code>curl -G -o icon.png "https://monoicon.mq1.dev/api/v2/icon" --data-urlencode "color=oklch(70% 0.25 340)" -d size=512</code></pre>
			<div class="mt-4 flex items-center gap-3">
				<img
					v-for="c in samples"
					:key="c"
					:src="`/api/v2/icon?color=${encodeURIComponent(c)}&size=96`"
					:alt="c"
					width="48"
					height="48"
					draggable="false"
					class="rounded-xl border border-line"
				/>
				<p class="text-xs text-sub">* 本APIで生成した画像</p>
			</div>
		</section>

		<section class="mt-12" data-intro>
			<h2 class="font-mono text-lg font-semibold">GET /api/v2/palette</h2>
			<p class="mt-2 text-sm leading-7 text-sub">
				ランダムパレット12色と初期選択色をレスポンスします。gamut=srgbはHEX、gamut=display-p3はDisplay
				P3色域を基準としたoklch()文字列を返します。後者はsRGB色域外の色を含む場合があります。
			</p>

			<h3 class="mt-6 text-[11px] font-medium tracking-[0.2em] text-sub">QUERY PARAMETERS</h3>
			<div class="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
				<div v-for="p in paletteParams" :key="p.name" class="border-b border-line px-5 py-4 last:border-b-0">
					<div class="flex flex-wrap items-center gap-2">
						<code class="font-mono text-sm font-semibold">{{ p.name }}</code>
						<span class="text-xs text-sub">{{ p.type }}</span>
						<span class="rounded-full px-2 py-0.5 text-[10px] font-medium" :class="p.required ? 'bg-ink text-white' : 'bg-ink/5 text-sub'">
							{{ p.required ? '必須' : '任意' }}
						</span>
					</div>
					<p class="mt-1.5 text-sm text-sub">{{ p.desc }}</p>
				</div>
			</div>

			<h3 class="mt-6 text-[11px] font-medium tracking-[0.2em] text-sub">RESPONSE</h3>
			<p class="mt-2 text-sm leading-7 text-sub">パラメータが不正な場合は400と以下のメッセージをレスポンスします。</p>
			<ul class="mt-2 space-y-1">
				<li v-for="e in paletteErrors" :key="e">
					<code class="font-mono text-xs text-sub">{{ e }}</code>
				</li>
			</ul>
			<pre
				class="mt-3 overflow-x-auto rounded-2xl border border-line bg-white p-5 font-mono text-xs leading-6"
			><code>{{ paletteExample }}</code></pre>

			<h3 class="mt-6 text-[11px] font-medium tracking-[0.2em] text-sub">EXAMPLE</h3>
			<pre
				class="mt-3 overflow-x-auto rounded-2xl border border-line bg-white p-5 font-mono text-xs leading-6"
			><code>curl "https://monoicon.mq1.dev/api/v2/palette?gamut=display-p3"</code></pre>
		</section>
	</main>
</template>
