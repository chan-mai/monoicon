<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel, RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import * as v from 'valibot';

const HUE_GRADIENT = 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)';

const { color, palette, regeneratePalette } = useIcon();

const regenerating = ref(false);

async function onRegenerate() {
	regenerating.value = true;
	try {
		await regeneratePalette();
	} finally {
		regenerating.value = false;
	}
}

const hexInput = ref(color.value);
const hexError = ref('');

const svEl = ref<HTMLDivElement>();
const hueEl = ref<HTMLDivElement>();
const hsv = reactive({ h: 0, s: 0, v: 1 });
let dragging = false;

const svStyle = computed(() => ({
	background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
}));

function hexToHsv(hex: string): { h: number; s: number; v: number } {
	const n = parseInt(hex.slice(1), 16);
	const r = ((n >> 16) & 255) / 255;
	const g = ((n >> 8) & 255) / 255;
	const b = (n & 255) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;
	let h = 0;
	if (d > 0) {
		if (max === r) h = ((g - b) / d) % 6;
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h *= 60;
		if (h < 0) h += 360;
	}
	return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToHex(h: number, s: number, val: number): string {
	const c = val * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = val - c;
	let r = 0;
	let g = 0;
	let b = 0;
	if (h < 60) {
		r = c;
		g = x;
	} else if (h < 120) {
		r = x;
		g = c;
	} else if (h < 180) {
		g = c;
		b = x;
	} else if (h < 240) {
		g = x;
		b = c;
	} else if (h < 300) {
		r = x;
		b = c;
	} else {
		r = c;
		b = x;
	}
	const to = (u: number) =>
		Math.round((u + m) * 255)
			.toString(16)
			.padStart(2, '0');
	return `#${to(r)}${to(g)}${to(b)}`;
}

watch(
	color,
	(val) => {
		if (normalizeHex(hexInput.value) !== val) {
			hexInput.value = val;
			hexError.value = '';
		}
		if (!dragging) {
			const parsed = hexToHsv(normalizeHex(val));
			if (parsed.s > 0.02) hsv.h = parsed.h;
			hsv.s = parsed.s;
			hsv.v = parsed.v;
		}
	},
	{ immediate: true },
);

function clamp01(n: number): number {
	return Math.min(1, Math.max(0, n));
}

function applyHsv() {
	color.value = hsvToHex(hsv.h, hsv.s, hsv.v);
}

function svPointer(e: PointerEvent) {
	const rect = svEl.value!.getBoundingClientRect();
	hsv.s = clamp01((e.clientX - rect.left) / rect.width);
	hsv.v = 1 - clamp01((e.clientY - rect.top) / rect.height);
	applyHsv();
}

function huePointer(e: PointerEvent) {
	const rect = hueEl.value!.getBoundingClientRect();
	hsv.h = clamp01((e.clientX - rect.left) / rect.width) * 359.9;
	applyHsv();
}

function startDrag(e: PointerEvent, handler: (e: PointerEvent) => void) {
	e.preventDefault();
	dragging = true;
	handler(e);
	const move = (ev: PointerEvent) => handler(ev);
	const up = () => {
		dragging = false;
		window.removeEventListener('pointermove', move);
	};
	window.addEventListener('pointermove', move);
	window.addEventListener('pointerup', up, { once: true });
}

function startSvDrag(e: PointerEvent) {
	startDrag(e, svPointer);
}

function startHueDrag(e: PointerEvent) {
	startDrag(e, huePointer);
}

function onHexInput() {
	if (hexInput.value.trim() === '') {
		hexError.value = '';
		return;
	}
	const result = v.safeParse(hexColorSchema, hexInput.value);
	if (result.success) {
		hexError.value = '';
		color.value = normalizeHex(result.output);
	} else {
		hexError.value = result.issues[0].message;
	}
}
</script>

<template>
	<div class="space-y-8">
		<RadioGroup :model-value="color" @update:model-value="color = $event">
			<div class="flex items-center justify-between">
				<RadioGroupLabel class="text-[11px] font-medium tracking-[0.2em] text-sub"> PALETTE </RadioGroupLabel>
				<button
					type="button"
					:disabled="regenerating"
					class="inline-flex items-center gap-1.5 border-none text-xs font-medium text-sub transition-colors hover:text-ink disabled:opacity-60"
					@click="onRegenerate"
				>
					<Icon name="lucide:refresh-cw" class="h-3.5 w-3.5" :class="regenerating && 'animate-spin'" />
					Change
				</button>
			</div>
			<div class="mt-3 grid grid-cols-6 gap-2.5 sm:gap-3">
				<RadioGroupOption v-for="(c, i) in palette" :key="i" v-slot="{ checked }" :value="c" class="cursor-pointer focus:outline-none">
					<span
						class="block aspect-square rounded-[24%] border border-line transition-all duration-300"
						:class="checked ? 'scale-90 ring-2 ring-ink ring-offset-2 ring-offset-white' : 'hover:scale-95'"
						:style="{ backgroundColor: c }"
					/>
				</RadioGroupOption>
			</div>
		</RadioGroup>

		<div>
			<p class="text-[11px] font-medium tracking-[0.2em] text-sub">CUSTOM</p>
			<div class="mt-3 flex items-center gap-3">
				<Popover class="relative">
					<PopoverButton
						class="block h-12 w-12 shrink-0 cursor-pointer rounded-2xl border border-line transition-transform duration-200 hover:scale-95 active:scale-90 focus:outline-none"
						:style="{ backgroundColor: color }"
						aria-label="Open color picker"
					/>
					<transition
						enter-active-class="transition duration-150 ease-out"
						enter-from-class="scale-95 opacity-0"
						enter-to-class="scale-100 opacity-100"
						leave-active-class="transition duration-100 ease-in"
						leave-from-class="scale-100 opacity-100"
						leave-to-class="scale-95 opacity-0"
					>
						<PopoverPanel class="absolute bottom-full left-0 z-30 mb-2 w-64 origin-bottom-left rounded-2xl border border-line bg-white p-4">
							<div ref="svEl" class="relative h-40 cursor-crosshair touch-none rounded-xl" :style="svStyle" @pointerdown="startSvDrag">
								<span
									class="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-ink/25"
									:style="{
										left: `${hsv.s * 100}%`,
										top: `${(1 - hsv.v) * 100}%`,
										backgroundColor: color,
									}"
								/>
							</div>
							<div
								ref="hueEl"
								class="relative mt-4 h-3 cursor-pointer touch-none rounded-full"
								:style="{ background: HUE_GRADIENT }"
								@pointerdown="startHueDrag"
							>
								<span
									class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-ink/25"
									:style="{
										left: `${(hsv.h / 360) * 100}%`,
										backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
									}"
								/>
							</div>
							<div class="mt-4 flex items-center justify-between">
								<span class="h-6 w-6 rounded-lg border border-line" :style="{ backgroundColor: color }" />
								<span class="text-sm tracking-[0.15em]">{{ color }}</span>
							</div>
						</PopoverPanel>
					</transition>
				</Popover>
				<input
					v-model="hexInput"
					type="text"
					spellcheck="false"
					placeholder="#c5d8f0"
					class="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm tracking-[0.15em] focus:border-ink/30 focus:outline-none"
					aria-label="Hex color"
					@input="onHexInput"
				/>
			</div>
			<p v-if="hexError" class="mt-2 text-xs text-[#c0442e]">{{ hexError }}</p>
		</div>
	</div>
</template>
