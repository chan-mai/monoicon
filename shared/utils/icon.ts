import * as v from 'valibot';

export const SIZE_PRESETS = [256, 512, 1024];

export interface IconFormat {
	id: 'png' | 'jpeg' | 'webp' | 'jxl' | 'ppm';
	label: string;
	mime: string;
	ext: string;
	deprecated?: boolean;
}

export const DEFAULT_FORMAT: IconFormat = { id: 'png', label: 'PNG', mime: 'image/png', ext: 'png' };

export const FORMATS: IconFormat[] = [
	DEFAULT_FORMAT,
	{ id: 'jpeg', label: 'JPEG', mime: 'image/jpeg', ext: 'jpg' },
	{ id: 'webp', label: 'WebP', mime: 'image/webp', ext: 'webp' },
	{ id: 'jxl', label: 'JPEG XL', mime: 'image/jxl', ext: 'jxl', deprecated: true },
	{ id: 'ppm', label: 'PPM', mime: 'image/x-portable-pixmap', ext: 'ppm', deprecated: true },
];

export const hexColorSchema = v.pipe(v.string(), v.trim(), v.regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i, 'Use #RGB or #RRGGBB format'));

export const customSizeSchema = v.pipe(
	v.number('Enter a number'),
	v.integer('Enter an integer'),
	v.minValue(1, 'Minimum size is 1'),
	v.maxValue(2048, 'Maximum size is 2048'),
);

// #RGBを#RRGGBB小文字統一
export function normalizeHex(input: string): string {
	const hex = input.trim().toLowerCase();
	if (/^#[0-9a-f]{3}$/.test(hex)) {
		return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
	}
	return hex;
}
