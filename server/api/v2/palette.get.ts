import * as v from 'valibot';

const querySchema = v.object({
	gamut: v.optional(v.picklist(['srgb', 'display-p3'], 'Invalid gamut: expected srgb or display-p3'), 'srgb'),
});

export default defineEventHandler((event) => {
	const parsed = v.safeParse(querySchema, getQuery(event));
	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			statusMessage: parsed.issues[0].message,
		});
	}
	return parsed.output.gamut === 'display-p3' ? generatePaletteP3() : generatePalette();
});
