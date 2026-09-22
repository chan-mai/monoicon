import { converter } from 'culori';

const toP3 = converter('p3');

function hslToHex(h: number, s: number, l: number): string {
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		return Math.round(c * 255)
			.toString(16)
			.padStart(2, '0');
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}

// 基調色相2-3個の周辺に分布させ構成を変える
function generateHues(): number[] {
	const centers = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => Math.random() * 360);
	const hues = Array.from({ length: 12 }, (_, i) => {
		if (Math.random() < 0.15) return Math.random() * 360;
		const c = centers[i % centers.length] ?? 0;
		return (c + (Math.random() - 0.5) * 80 + 360) % 360;
	});
	hues.sort((a, b) => a - b);
	return hues;
}

export function generatePalette(): { colors: string[]; initial: string } {
	const colors = generateHues().map((h) => hslToHex(h, 0.42 + Math.random() * 0.26, 0.83 + Math.random() * 0.08));
	return {
		colors,
		initial: colors[Math.floor(Math.random() * colors.length)] ?? '#eadcf0',
	};
}

// P3内の最大彩度を二分探索
function maxP3Chroma(l: number, h: number): number {
	let lo = 0;
	let hi = 0.4;
	for (let i = 0; i < 20; i++) {
		const mid = (lo + hi) / 2;
		const p3 = toP3({ mode: 'oklch', l, c: mid, h });
		if ([p3.r, p3.g, p3.b].every((n) => n >= 0 && n <= 1)) lo = mid;
		else hi = mid;
	}
	return lo;
}

export function generatePaletteP3(): { colors: string[]; initial: string } {
	const colors = generateHues().map((h) => {
		const l = 0.86 + Math.random() * 0.06;
		const c = maxP3Chroma(l, h) * (0.55 + Math.random() * 0.4);
		return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
	});
	return {
		colors,
		initial: colors[Math.floor(Math.random() * colors.length)] ?? 'oklch(90% 0.06 340)',
	};
}
