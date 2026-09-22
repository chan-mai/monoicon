import * as v from 'valibot';
import type { Rgb } from '../../utils/encode';

const querySchema = v.object({
	color: cssColorSchema,
	size: v.optional(
		v.pipe(
			v.string('Invalid size: expected integer between 1 and 2048'),
			v.transform(Number),
			v.integer('Invalid size: expected integer between 1 and 2048'),
			v.minValue(1, 'Invalid size: expected integer between 1 and 2048'),
			v.maxValue(2048, 'Invalid size: expected integer between 1 and 2048'),
		),
		'512',
	),
	format: v.optional(v.picklist(['png', 'jpeg', 'webp', 'jxl', 'ppm'], 'Invalid format: expected png, jpeg, webp, jxl or ppm'), 'png'),
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

	const inSrgb = isInSrgb(color);
	if (!inSrgb && format.id !== 'png') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Color is outside the sRGB gamut; use format=png',
		});
	}

	let body: Uint8Array;
	if (!inSrgb) {
		// sRGB外はDisplay P3のPNGで出力
		body = await encodeSolidPng(size, cssToP38(color) as Rgb, true);
	} else {
		const rgb = cssToSrgb8(color) as Rgb;
		if (format.id === 'png') {
			body = await encodeSolidPng(size, rgb);
		} else if (format.id === 'jpeg') {
			body = encodeSolidJpeg(size, rgb);
		} else if (format.id === 'webp') {
			body = await encodeSolidWebp(size, rgb);
		} else if (format.id === 'ppm') {
			body = encodeSolidPpm(size, rgb);
		} else {
			body = await encodeSolidJxl(size, rgb);
		}
	}

	setHeader(event, 'Content-Type', format.mime);
	setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
	if (getQuery(event).download !== undefined) {
		setHeader(event, 'Content-Disposition', `attachment; filename="monoicon-${colorToSlug(color)}-${size}.${format.ext}"`);
	}
	return body;
});
