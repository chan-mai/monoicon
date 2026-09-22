import * as v from 'valibot';

export function useExport() {
	const { color } = useIcon();

	const formatId = useState<IconFormat['id']>('export-format', () => 'png');
	const sizeChoice = useState<number | 'custom'>('export-size', () => 512);
	// type=numberのv-modelは数値化されるためstring|number
	const customSizeInput = useState<string | number>('export-custom-size', () => '');

	const currentFormat = computed(() => FORMATS.find((f) => f.id === formatId.value) ?? DEFAULT_FORMAT);

	// sRGB外はPNGのみ書き出し可能
	const colorInSrgb = computed(() => isInSrgb(color.value));

	watch(colorInSrgb, (inSrgb) => {
		if (!inSrgb && formatId.value !== 'png') formatId.value = 'png';
	});

	const customSize = computed<{ size: number | null; error: string }>(() => {
		const raw = String(customSizeInput.value).trim();
		if (raw === '') return { size: null, error: '' };
		const result = v.safeParse(customSizeSchema, Number(raw));
		return result.success ? { size: result.output, error: '' } : { size: null, error: result.issues[0].message };
	});

	const sizeError = computed(() => (sizeChoice.value === 'custom' ? customSize.value.error : ''));

	const resolvedSize = computed(() => (sizeChoice.value === 'custom' ? customSize.value.size : sizeChoice.value));

	const fileLabel = computed(() => {
		if (!resolvedSize.value) return '—';
		return `monoicon-${colorToSlug(color.value)}-${resolvedSize.value}.${currentFormat.value.ext}`;
	});

	const downloading = useState('export-downloading', () => false);
	const downloadCount = useState('export-download-count', () => 0);

	async function download() {
		const size = resolvedSize.value;
		if (!size || downloading.value) return;
		downloading.value = true;
		try {
			const params = new URLSearchParams({
				color: color.value,
				size: String(size),
				format: formatId.value,
			});
			const blob = await $fetch<Blob>(`/api/v2/icon?${params.toString()}`, {
				responseType: 'blob',
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = fileLabel.value;
			a.click();
			URL.revokeObjectURL(url);
			downloadCount.value++;
		} finally {
			downloading.value = false;
		}
	}

	return {
		formatId,
		sizeChoice,
		customSizeInput,
		currentFormat,
		colorInSrgb,
		sizeError,
		resolvedSize,
		fileLabel,
		downloading,
		downloadCount,
		download,
	};
}
