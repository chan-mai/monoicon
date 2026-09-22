<script setup lang="ts">
import { gsap } from 'gsap';
import Lenis from 'lenis';

const { color, palette } = useIcon();
const { resolvedSize, downloading, downloadCount, download } = useExport();

await useAsyncData('palette-init', async () => {
	if (palette.value.length === 0) {
		const res = await $fetch<PaletteResponse>('/api/v2/palette');
		palette.value = res.colors;
		color.value = res.initial;
	}
	return true;
});

const step = ref(0);
const stageReady = ref(false);

// ダウンロード完了表示
const downloadButton = useTemplateRef('downloadButton');
const justDownloaded = ref(false);
let downloadedTimer: ReturnType<typeof setTimeout> | null = null;

watch(downloadCount, () => {
	justDownloaded.value = true;
	if (downloadedTimer) clearTimeout(downloadedTimer);
	downloadedTimer = setTimeout(() => {
		justDownloaded.value = false;
	}, 2000);
	if (!reduce && downloadButton.value) {
		gsap.fromTo(downloadButton.value, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
	}
});

watch(step, () => {
	if (import.meta.client) {
		if (lenis) {
			lenis.scrollTo(0, { immediate: true });
		} else {
			window.scrollTo({ top: 0 });
		}
	}
});

const steps = [{ label: 'カラー' }, { label: 'プレビュー' }, { label: '書き出し' }];

let reduce = false;
let lenis: Lenis | null = null;

function onStepEnter(el: Element, done: () => void) {
	if (reduce) {
		done();
		return;
	}
	gsap.fromTo(el, { autoAlpha: 0, x: 28 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power3.out', onComplete: done });
}

function onStepLeave(el: Element, done: () => void) {
	if (reduce) {
		done();
		return;
	}
	gsap.to(el, {
		autoAlpha: 0,
		x: -28,
		duration: 0.25,
		ease: 'power2.in',
		onComplete: done,
	});
}

onMounted(() => {
	reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduce) return;

	lenis = new Lenis();
	const raf = (time: number) => {
		lenis?.raf(time * 1000);
	};
	gsap.ticker.add(raf);
	gsap.ticker.lagSmoothing(0);

	gsap.from('[data-intro]', {
		y: 24,
		autoAlpha: 0,
		duration: 0.8,
		stagger: 0.09,
		ease: 'power3.out',
	});

	onUnmounted(() => {
		gsap.ticker.remove(raf);
		lenis?.destroy();
		lenis = null;
	});
});
</script>

<template>
	<main class="mx-auto w-full max-w-6xl px-5 pb-24 md:px-8">
		<section class="mt-10 grid items-start gap-10 lg:mt-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
			<div class="min-w-0 lg:sticky lg:top-8" data-intro>
				<div class="relative">
					<IconStage :color="color" :step="step" :pulse="downloadCount" class="h-[360px] w-full md:h-[500px]" @ready="stageReady = true" />
					<div v-if="!stageReady" class="absolute inset-0 flex items-center justify-center">
						<Icon name="lucide:loader-circle" class="h-8 w-8 animate-spin text-sub" />
					</div>
					<div
						class="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-line bg-white/85 py-2 pl-2.5 pr-4 backdrop-blur"
					>
						<span class="h-5 w-5 shrink-0 rounded-md border border-line" :style="{ backgroundColor: color }" />
						<span class="whitespace-nowrap text-sm tracking-[0.1em]">{{ color }}</span>
					</div>
				</div>
			</div>

			<div class="min-w-0" data-intro>
				<StepBar v-model="step" :steps="steps" />
				<div class="mt-10 min-h-[420px]">
					<Transition :css="false" mode="out-in" @enter="onStepEnter" @leave="onStepLeave">
						<div :key="step">
							<ColorPicker v-if="step === 0" />
							<PreviewGrid v-else-if="step === 1" />
							<ExportPanel v-else />
						</div>
					</Transition>
				</div>
				<div
					class="sticky bottom-10 z-10 mt-10 flex items-center justify-between rounded-2xl border border-line bg-white/75 px-4 py-3 backdrop-blur"
				>
					<button
						v-if="step > 0"
						type="button"
						class="inline-flex items-center gap-2 rounded-full border-none px-5 py-3 text-sm font-medium text-sub transition-colors hover:text-ink"
						@click="step--"
					>
						<Icon name="lucide:chevron-left" class="h-4 w-4" />
						戻る
					</button>
					<span v-else />
					<button
						v-if="step < 2"
						type="button"
						class="inline-flex items-center gap-2 rounded-full border-none bg-ink px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
						@click="step++"
					>
						次へ
						<Icon name="lucide:chevron-right" class="h-4 w-4" />
					</button>
					<button
						v-else
						ref="downloadButton"
						type="button"
						:disabled="!resolvedSize || downloading"
						class="inline-flex items-center gap-2 rounded-full border-none bg-ink px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-40"
						@click="download"
					>
						<Icon
							:name="downloading ? 'lucide:loader-circle' : justDownloaded ? 'lucide:check' : 'lucide:download'"
							class="h-4 w-4"
							:class="downloading && 'animate-spin'"
						/>
						{{ justDownloaded ? '保存しました' : 'ダウンロード' }}
					</button>
				</div>
			</div>
		</section>
	</main>
</template>
