import * as v from 'valibot';
import type { Rgb } from '../../utils/encode';

const querySchema = v.object({
	color: v.pipe(
		v.string('Invalid color: expected 6-digit hex'),
		v.transform((value) => value.replace(/^#/, '')),
		v.regex(/^[0-9a-f]{6}$/i, 'Invalid color: expected 6-digit hex'),
		v.toLowerCase(),
	),
	size: v.optional(
		v.pipe(
			v.string('Invalid size: expected integer between 16 and 2048'),
			v.transform(Number),
			v.integer('Invalid size: expected integer between 16 and 2048'),
			v.minValue(16, 'Invalid size: expected integer between 16 and 2048'),
			v.maxValue(2048, 'Invalid size: expected integer between 16 and 2048'),
		),
		'512',
	),
	format: v.optional(v.picklist(['png', 'jpeg', 'webp', 'jxl'], 'Invalid format: expected png, jpeg, webp or jxl'), 'png'),
});

export default defineEventHandler(async (event) => {
	const parsed = v.safeParse(querySchema, getQuery(event));
	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			statusMessage: parsed.issues[0].message,
		});
	}
	const { color, size } = parsed.output;
	const format = FORMATS.find((f) => f.id === parsed.output.format) ?? DEFAULT_FORMAT;

	const rgb: Rgb = [parseInt(color.slice(0, 2), 16), parseInt(color.slice(2, 4), 16), parseInt(color.slice(4, 6), 16)];

	let body: Uint8Array;
	if (format.id === 'png') {
		body = await encodeSolidPng(size, rgb);
	} else if (format.id === 'jpeg') {
		body = encodeSolidJpeg(size, rgb);
	} else if (format.id === 'webp') {
		body = await encodeSolidWebp(size, rgb);
	} else {
		body = await encodeSolidJxl(size, rgb);
	}

	setHeader(event, 'Content-Type', format.mime);
	setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
	if (getQuery(event).download !== undefined) {
		setHeader(event, 'Content-Disposition', `attachment; filename="monoicon-${color}-${size}.${format.ext}"`);
	}
	return body;
});
