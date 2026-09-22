import * as v from 'valibot';

export function useExport() {
	const { color } = useIcon();

	const formatId = useState<IconFormat['id']>('export-format', () => 'png');
	const sizeChoice = useState<number | 'custom'>('export-size', () => 512);
	// type=numberのv-modelは数値化されるためstring|number
	const customSizeInput = useState<string | number>('export-custom-size', () => '');

	const currentFormat = computed(() => FORMATS.find((f) => f.id === formatId.value) ?? DEFAULT_FORMAT);

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
		return `monoicon-${normalizeHex(color.value).slice(1)}-${resolvedSize.value}.${currentFormat.value.ext}`;
	});

	const downloading = useState('export-downloading', () => false);

	async function download() {
		const size = resolvedSize.value;
		if (!size || downloading.value) return;
		downloading.value = true;
		try {
			const params = new URLSearchParams({
				color: normalizeHex(color.value).slice(1),
				size: String(size),
				format: formatId.value,
			});
			const blob = await $fetch<Blob>(`/api/v1/icon?${params.toString()}`, {
				responseType: 'blob',
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = fileLabel.value;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			downloading.value = false;
		}
	}

	return {
		formatId,
		sizeChoice,
		customSizeInput,
		currentFormat,
		sizeError,
		resolvedSize,
		fileLabel,
		downloading,
		download,
	};
}
