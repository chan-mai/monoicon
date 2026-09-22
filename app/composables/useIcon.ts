export interface PaletteResponse {
	colors: string[];
	initial: string;
}

export type PaletteGamut = 'srgb' | 'display-p3';

export function useIcon() {
	const palette = useState<string[]>('icon-palette', () => []);
	const color = useState('icon-color', () => '#eadcf0');
	const gamut = useState<PaletteGamut>('icon-gamut', () => 'srgb');

	async function regeneratePalette() {
		const res = await $fetch<PaletteResponse>('/api/v2/palette', { query: { gamut: gamut.value } });
		palette.value = res.colors;
	}

	return { color, palette, gamut, regeneratePalette };
}
