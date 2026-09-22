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
export function generatePalette(): { colors: string[]; initial: string } {
	const centers = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => Math.random() * 360);
	const hues = Array.from({ length: 12 }, (_, i) => {
		if (Math.random() < 0.15) return Math.random() * 360;
		const c = centers[i % centers.length] ?? 0;
		return (c + (Math.random() - 0.5) * 80 + 360) % 360;
	});
	hues.sort((a, b) => a - b);
	const colors = hues.map((h) => hslToHex(h, 0.42 + Math.random() * 0.26, 0.83 + Math.random() * 0.08));
	return {
		colors,
		initial: colors[Math.floor(Math.random() * colors.length)] ?? '#eadcf0',
	};
}
