<script setup lang="ts">
useHead({ title: 'API | monoicon' });

const iconParams = [
	{ name: 'color', type: 'string', required: true, desc: '6桁のHEXカラー(例: e0719a, #e0719a)' },
	{ name: 'size', type: 'integer', required: false, desc: '16〜2048の整数。既定値は512' },
	{ name: 'format', type: 'string', required: false, desc: 'png / jpeg / webpのいずれか。既定値はpng' },
	{ name: 'download', type: 'flag', required: false, desc: '付与するとContent-Disposition: attachmentで応答' },
];

const iconErrors = [
	'Invalid color: expected 6-digit hex',
	'Invalid size: expected integer between 16 and 2048',
	'Invalid format: expected png, jpeg or webp',
];

const { data: palette } = await useAsyncData('docs-palette', () => $fetch<PaletteResponse>('/api/v1/palette'));
const samples = computed(() => (palette.value?.colors ?? []).slice(0, 4).map((c) => c.slice(1)));

const paletteExample = `{
	"colors": [
		"#f6d8d2", "#f3e2d7", "#bfebda", "#c7eadf",
		"#bbecf0", "#ced5f1", "#d6d7f7", "#e0d6f2",
		"#dbc8f0", "#f0d4e5", "#edc7cb", "#f2ddde"
	],
	"initial": "#bfebda"
}`;
</script>

<template>
	<main class="mx-auto w-full max-w-3xl px-5 pb-24 md:px-8">
		<h1 class="mt-10 font-display text-3xl font-semibold tracking-tight md:mt-14">API</h1>
		<p class="mt-3 text-sm leading-7 text-sub">単色アイコン画像を返すHTTP APIです。認証は不要です。</p>

		<section class="mt-12">
			<h2 class="font-mono text-lg font-semibold">GET /api/v1/icon</h2>
			<p class="mt-2 text-sm leading-7 text-sub">指定した1色で塗りつぶした正方形の画像をレスポンスします。</p>

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
				画像バイナリ(image/png, image/jpeg, image/webp)をレスポンスします。<code class="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-xs"
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
			><code>curl -o icon.png "https://monoicon.mq1.dev/api/v1/icon?color=e0719a&size=512&format=png"</code></pre>
			<div class="mt-4 flex items-center gap-3">
				<img
					v-for="c in samples"
					:key="c"
					:src="`/api/v1/icon?color=${c}&size=96`"
					:alt="`#${c}`"
					width="48"
					height="48"
					class="rounded-xl border border-line"
				/>
				<p class="text-xs text-sub">* 本APIで生成した画像</p>
			</div>
		</section>

		<section class="mt-12">
			<h2 class="font-mono text-lg font-semibold">GET /api/v1/palette</h2>
			<p class="mt-2 text-sm leading-7 text-sub">ランダムパレット12色と初期選択色をレスポンスします。パラメータはありません。</p>

			<h3 class="mt-6 text-[11px] font-medium tracking-[0.2em] text-sub">RESPONSE</h3>
			<pre
				class="mt-3 overflow-x-auto rounded-2xl border border-line bg-white p-5 font-mono text-xs leading-6"
			><code>{{ paletteExample }}</code></pre>
		</section>
	</main>
</template>
