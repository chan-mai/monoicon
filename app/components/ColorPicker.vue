<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel, RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import * as v from 'valibot';
import { converter, parse } from 'culori';

const HUE_GRADIENT = 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)';

const { color, palette, gamut, regeneratePalette } = useIcon();

const regenerating = ref(false);

async function onRegenerate() {
	regenerating.value = true;
	try {
		await regeneratePalette();
	} finally {
		regenerating.value = false;
	}
}

// パレット色域
const GAMUTS = [
	{ id: 'srgb', label: 'sRGB' },
	{ id: 'display-p3', label: 'Display P3' },
] as const;

async function switchGamut(g: PaletteGamut) {
	if (gamut.value === g || regenerating.value) return;
	gamut.value = g;
	await onRegenerate();
}

// 入力モード
const MODES = [
	{ id: 'hex', label: 'HEX', placeholder: '#c5d8f0' },
	{ id: 'rgb', label: 'RGB', placeholder: 'rgb(197 216 240)' },
	{ id: 'hsl', label: 'HSL', placeholder: 'hsl(213 58% 86%)' },
	{ id: 'oklch', label: 'OKLCH', placeholder: 'oklch(88% 0.03 253)' },
] as const;
type ModeId = (typeof MODES)[number]['id'];

const mode = ref<ModeId>('hex');
const colorInput = ref('');
const colorError = ref('');
const currentMode = computed(() => MODES.find((m) => m.id === mode.value) ?? MODES[0]);

const toRgbC = converter('rgb');
const toHslC = converter('hsl');
const toOklchC = converter('oklch');

function formatColorAs(css: string, target: ModeId): string {
	const parsed = parse(css);
	if (!parsed) return css;
	if (target === 'hex') return cssToDisplayHex(css);
	if (target === 'rgb') {
		const c = toRgbC(parsed);
		return `rgb(${Math.round(c.r * 255)} ${Math.round(c.g * 255)} ${Math.round(c.b * 255)})`;
	}
	if (target === 'hsl') {
		const c = toHslC(parsed);
		return `hsl(${Math.round(c.h ?? 0)} ${Math.round(c.s * 100)}% ${Math.round(c.l * 100)}%)`;
	}
	const c = toOklchC(parsed);
	return `oklch(${(c.l * 100).toFixed(1)}% ${c.c.toFixed(3)} ${Math.round(c.h ?? 0)})`;
}

function switchMode(id: ModeId) {
	mode.value = id;
	colorInput.value = formatColorAs(color.value, id);
	colorError.value = '';
}

let selfValue: string | null = null;

// モード別ビジュアルピッカー状態
const C_MAX = 0.4;
const lch = reactive({ l: 0.8, c: 0.1, h: 340 });
const hslSt = reactive({ h: 340, s: 0.5, l: 0.8 });
const rgbSt = reactive({ r: 224, g: 113, b: 154 });
const toP3C = converter('p3');
const lcWrap = ref<HTMLDivElement>();
const lcCanvas = ref<HTMLCanvasElement>();
const oklchHueEl = ref<HTMLDivElement>();
let lcCtx: CanvasRenderingContext2D | null = null;
let lcP3 = false;
let drawScheduled = false;

const oklchHueGradient = computed(() => {
	const stops = Array.from({ length: 13 }, (_, i) => `oklch(75% 0.15 ${i * 30})`).join(', ');
	return `linear-gradient(to right, ${stops})`;
});

function clampChannel(n: number): number {
	return Math.min(1, Math.max(0, n));
}

function drawLc() {
	const cv = lcCanvas.value;
	if (!cv || !lcCtx) return;
	const w = cv.width;
	const h = cv.height;
	const conv = lcP3 ? toP3C : toRgbC;
	const img = lcP3 ? lcCtx.createImageData(w, h, { colorSpace: 'display-p3' }) : lcCtx.createImageData(w, h);
	const data = img.data;
	const isOklch = mode.value === 'oklch';
	for (let y = 0; y < h; y++) {
		const l = 1 - y / h;
		for (let x = 0; x < w; x++) {
			const rgb = isOklch ? conv({ mode: 'oklch', l, c: (x / w) * C_MAX, h: lch.h }) : conv({ mode: 'hsl', h: hslSt.h, s: x / w, l });
			const i = (y * w + x) * 4;
			data[i] = Math.round(clampChannel(rgb.r) * 255);
			data[i + 1] = Math.round(clampChannel(rgb.g) * 255);
			data[i + 2] = Math.round(clampChannel(rgb.b) * 255);
			data[i + 3] = 255;
		}
	}
	lcCtx.putImageData(img, 0, 0);
}

function scheduleDrawLc() {
	if (drawScheduled) return;
	drawScheduled = true;
	requestAnimationFrame(() => {
		drawScheduled = false;
		drawLc();
	});
}

watch(lcCanvas, (cv) => {
	if (!cv) return;
	try {
		lcCtx = cv.getContext('2d', { colorSpace: 'display-p3' });
		lcP3 = true;
	} catch {
		lcCtx = null;
	}
	if (!lcCtx) {
		lcCtx = cv.getContext('2d');
		lcP3 = false;
	}
	drawLc();
});

watch(() => [mode.value, lch.h, hslSt.h], scheduleDrawLc);

function commitOklch() {
	const css = `oklch(${(lch.l * 100).toFixed(1)}% ${lch.c.toFixed(3)} ${Math.round(lch.h)})`;
	color.value = css;
}

function lcPointer(e: PointerEvent) {
	const rect = lcWrap.value!.getBoundingClientRect();
	lch.c = clampChannel((e.clientX - rect.left) / rect.width) * C_MAX;
	lch.l = 1 - clampChannel((e.clientY - rect.top) / rect.height);
	commitOklch();
}

function oklchHuePointer(e: PointerEvent) {
	const rect = oklchHueEl.value!.getBoundingClientRect();
	lch.h = clampChannel((e.clientX - rect.left) / rect.width) * 359.9;
	commitOklch();
}

function commitHsl() {
	color.value = `hsl(${Math.round(hslSt.h)} ${Math.round(hslSt.s * 100)}% ${Math.round(hslSt.l * 100)}%)`;
}

function hslPlanePointer(e: PointerEvent) {
	const rect = lcWrap.value!.getBoundingClientRect();
	hslSt.s = clampChannel((e.clientX - rect.left) / rect.width);
	hslSt.l = 1 - clampChannel((e.clientY - rect.top) / rect.height);
	commitHsl();
}

function hslHuePointer(e: PointerEvent) {
	const rect = oklchHueEl.value!.getBoundingClientRect();
	hslSt.h = clampChannel((e.clientX - rect.left) / rect.width) * 359.9;
	commitHsl();
}

function planePointer(e: PointerEvent) {
	if (mode.value === 'oklch') lcPointer(e);
	else hslPlanePointer(e);
}

function planeHuePointer(e: PointerEvent) {
	if (mode.value === 'oklch') oklchHuePointer(e);
	else hslHuePointer(e);
}

const planeHueGradient = computed(() => (mode.value === 'oklch' ? oklchHueGradient.value : HUE_GRADIENT));
const planeHue = computed(() => (mode.value === 'oklch' ? lch.h : hslSt.h));
const planeMarker = computed(() => (mode.value === 'oklch' ? { x: lch.c / C_MAX, y: 1 - lch.l } : { x: hslSt.s, y: 1 - hslSt.l }));

function commitRgb() {
	color.value = `rgb(${rgbSt.r} ${rgbSt.g} ${rgbSt.b})`;
}

const RGB_CHANNELS = ['r', 'g', 'b'] as const;
type RgbChannel = (typeof RGB_CHANNELS)[number];

const rgbTracks = computed(() => {
	const { r, g, b } = rgbSt;
	return {
		r: `linear-gradient(to right, rgb(0 ${g} ${b}), rgb(255 ${g} ${b}))`,
		g: `linear-gradient(to right, rgb(${r} 0 ${b}), rgb(${r} 255 ${b}))`,
		b: `linear-gradient(to right, rgb(${r} ${g} 0), rgb(${r} ${g} 255))`,
	};
});

function startRgbDrag(e: PointerEvent, ch: RgbChannel) {
	const el = e.currentTarget as HTMLElement;
	startDrag(e, (ev) => {
		const rect = el.getBoundingClientRect();
		rgbSt[ch] = Math.round(clampChannel((ev.clientX - rect.left) / rect.width) * 255);
		commitRgb();
	});
}

function onColorInput() {
	if (colorInput.value.trim() === '') {
		colorError.value = '';
		return;
	}
	const result = v.safeParse(cssColorSchema, colorInput.value);
	if (result.success) {
		colorError.value = '';
		selfValue = result.output;
		color.value = result.output;
	} else {
		colorError.value = result.issues[0].message;
	}
}

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
		if (val !== selfValue) {
			colorInput.value = formatColorAs(val, mode.value);
			colorError.value = '';
		}
		selfValue = null;
		if (!dragging) {
			const parsed = hexToHsv(cssToDisplayHex(val));
			if (parsed.s > 0.02) hsv.h = parsed.h;
			hsv.s = parsed.s;
			hsv.v = parsed.v;
			const ok = toOklchC(parse(val)!);
			if (ok) {
				if (ok.c > 0.005 && ok.h !== undefined) lch.h = ok.h;
				lch.l = Math.min(1, Math.max(0, ok.l));
				lch.c = Math.min(C_MAX, ok.c);
			}
			const hs = toHslC(parse(val)!);
			if (hs) {
				if (hs.s > 0.02 && hs.h !== undefined) hslSt.h = hs.h;
				hslSt.s = clampChannel(hs.s);
				hslSt.l = clampChannel(hs.l);
			}
			const rg = toRgbC(parse(val)!);
			if (rg) {
				rgbSt.r = Math.round(clampChannel(rg.r) * 255);
				rgbSt.g = Math.round(clampChannel(rg.g) * 255);
				rgbSt.b = Math.round(clampChannel(rg.b) * 255);
			}
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

function startLcDrag(e: PointerEvent) {
	startDrag(e, planePointer);
}

function startPlaneHueDrag(e: PointerEvent) {
	startDrag(e, planeHuePointer);
}
</script>

<template>
	<div class="space-y-8">
		<RadioGroup :model-value="color" @update:model-value="color = $event">
			<div class="flex items-center justify-between">
				<RadioGroupLabel class="text-[11px] font-medium tracking-[0.2em] text-sub"> PALETTE </RadioGroupLabel>
				<div class="flex items-center gap-3">
					<div class="flex gap-1">
						<button
							v-for="g in GAMUTS"
							:key="g.id"
							type="button"
							:disabled="regenerating"
							class="rounded-full border-none px-2.5 py-1 text-[10px] font-medium transition-colors disabled:opacity-60"
							:class="gamut === g.id ? 'bg-ink text-white' : 'bg-ink/5 text-sub hover:text-ink'"
							@click="switchGamut(g.id)"
						>
							{{ g.label }}
						</button>
					</div>
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
			<div class="flex items-center justify-between">
				<p class="text-[11px] font-medium tracking-[0.2em] text-sub">CUSTOM</p>
				<div class="flex gap-1">
					<button
						v-for="m in MODES"
						:key="m.id"
						type="button"
						class="rounded-full border-none px-2.5 py-1 text-[10px] font-medium transition-colors"
						:class="mode === m.id ? 'bg-ink text-white' : 'bg-ink/5 text-sub hover:text-ink'"
						@click="switchMode(m.id)"
					>
						{{ m.label }}
					</button>
				</div>
			</div>
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
							<!-- HEX: HSVピッカー -->
							<template v-if="mode === 'hex'">
								<div ref="svEl" class="relative h-40 cursor-crosshair touch-none rounded-xl" :style="svStyle" @pointerdown="startSvDrag">
									<span
										class="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-ink/25"
										:style="{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: color }"
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
										:style="{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }"
									/>
								</div>
							</template>
							<!-- RGB: チャンネルスライダ -->
							<template v-else-if="mode === 'rgb'">
								<div v-for="ch in RGB_CHANNELS" :key="ch" class="mb-3 last:mb-0">
									<div class="mb-1 flex items-center justify-between text-[10px] font-medium tracking-[0.15em] text-sub">
										<span class="uppercase">{{ ch }}</span>
										<span>{{ rgbSt[ch] }}</span>
									</div>
									<div
										class="relative h-3 cursor-pointer touch-none rounded-full"
										:style="{ background: rgbTracks[ch] }"
										@pointerdown="startRgbDrag($event, ch)"
									>
										<span
											class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-ink/25"
											:style="{ left: `${(rgbSt[ch] / 255) * 100}%`, backgroundColor: color }"
										/>
									</div>
								</div>
							</template>
							<!-- HSL/OKLCH: 色空間平面+色相スライダ -->
							<template v-else>
								<div ref="lcWrap" class="relative h-40 cursor-crosshair touch-none overflow-hidden rounded-xl" @pointerdown="startLcDrag">
									<canvas ref="lcCanvas" width="120" height="80" class="h-full w-full"></canvas>
									<span
										class="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-ink/25"
										:style="{ left: `${planeMarker.x * 100}%`, top: `${planeMarker.y * 100}%`, backgroundColor: color }"
									/>
								</div>
								<div
									ref="oklchHueEl"
									class="relative mt-4 h-3 cursor-pointer touch-none rounded-full"
									:style="{ background: planeHueGradient }"
									@pointerdown="startPlaneHueDrag"
								>
									<span
										class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-ink/25"
										:style="{ left: `${(planeHue / 360) * 100}%`, backgroundColor: `hsl(${planeHue}, 100%, 50%)` }"
									/>
								</div>
							</template>
							<div class="mt-4 flex items-center justify-between gap-2">
								<span class="h-6 w-6 shrink-0 rounded-lg border border-line" :style="{ backgroundColor: color }" />
								<span class="whitespace-nowrap text-xs tracking-[0.05em]">{{ color }}</span>
							</div>
						</PopoverPanel>
					</transition>
				</Popover>
				<input
					v-model="colorInput"
					type="text"
					spellcheck="false"
					:placeholder="currentMode.placeholder"
					class="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm tracking-[0.1em] focus:border-ink/30 focus:outline-none"
					aria-label="Color input"
					@input="onColorInput"
				/>
			</div>
			<p v-if="colorError" class="mt-2 text-xs text-[#c0442e]">{{ colorError }}</p>
		</div>
	</div>
</template>
