import * as v from 'valibot';
import { converter, formatHex, parse } from 'culori';

const toRgb = converter('rgb');
const toP3 = converter('p3');

export const cssColorSchema = v.pipe(
	v.string('Invalid color: expected a CSS color'),
	v.trim(),
	v.check((s) => parse(s) !== undefined, 'Invalid color: expected a CSS color'),
);

function clamp01(n: number): number {
	return Math.min(1, Math.max(0, n));
}

// sRGB色域内か
export function isInSrgb(css: string): boolean {
	const c = parse(css);
	if (!c) return false;
	const rgb = toRgb(c);
	return [rgb.r, rgb.g, rgb.b].every((n) => n >= -1e-4 && n <= 1 + 1e-4);
}

// 表示近似用のsRGB HEX
export function cssToDisplayHex(css: string): string {
	const c = parse(css);
	if (!c) return '#000000';
	const rgb = toRgb(c);
	return formatHex({ mode: 'rgb', r: clamp01(rgb.r), g: clamp01(rgb.g), b: clamp01(rgb.b) });
}

// sRGBの8bit値
export function cssToSrgb8(css: string): [number, number, number] {
	const rgb = toRgb(parse(css)!);
	return [Math.round(clamp01(rgb.r) * 255), Math.round(clamp01(rgb.g) * 255), Math.round(clamp01(rgb.b) * 255)];
}

// Display P3の8bit値
export function cssToP38(css: string): [number, number, number] {
	const p3 = toP3(parse(css)!);
	return [Math.round(clamp01(p3.r) * 255), Math.round(clamp01(p3.g) * 255), Math.round(clamp01(p3.b) * 255)];
}

// ファイル名用に記号を除去
export function colorToSlug(css: string): string {
	return (
		css
			.toLowerCase()
			.replace(/[^a-z0-9.]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'color'
	);
}
