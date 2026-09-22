export interface PaletteResponse {
	colors: string[];
	initial: string;
}

export function useIcon() {
	const palette = useState<string[]>('icon-palette', () => []);
	const color = useState('icon-color', () => '#eadcf0');

	async function regeneratePalette() {
		const res = await $fetch<PaletteResponse>('/api/v1/palette');
		palette.value = res.colors;
	}

	return { color, palette, regeneratePalette };
}
