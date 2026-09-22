import { encode as jpegEncode } from 'jpeg-js';
import encodeWebp, { init as initWebp } from '@jsquash/webp/encode';
// @ts-expect-error wasmモジュール
import WEBP_ENC_WASM from '@jsquash/webp/codec/enc/webp_enc.wasm';

export type Rgb = [number, number, number];

const PNG_SIG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c >>> 0;
});

function crc32(...parts: Uint8Array[]): number {
	let c = 0xffffffff;
	for (const p of parts) {
		for (let i = 0; i < p.length; i++) {
			c = (CRC_TABLE[(c ^ (p[i] ?? 0)) & 0xff] ?? 0) ^ (c >>> 8);
		}
	}
	return (c ^ 0xffffffff) >>> 0;
}

function u32(n: number): Uint8Array {
	return new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
}

function concat(...parts: Uint8Array[]): Uint8Array {
	const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
	let off = 0;
	for (const p of parts) {
		out.set(p, off);
		off += p.length;
	}
	return out;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
	const t = new TextEncoder().encode(type);
	return concat(u32(data.length), t, data, u32(crc32(t, data)));
}

async function deflate(data: Uint8Array): Promise<Uint8Array> {
	const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream('deflate'));
	return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function encodeSolidPng(size: number, [r, g, b]: Rgb): Promise<Uint8Array> {
	// フィルタ0のRGBスキャンライン
	const stride = 1 + size * 3;
	const raw = new Uint8Array(stride * size);
	for (let x = 0; x < size; x++) {
		const p = 1 + x * 3;
		raw[p] = r;
		raw[p + 1] = g;
		raw[p + 2] = b;
	}
	for (let y = 1; y < size; y++) raw.copyWithin(y * stride, 0, stride);
	const ihdr = concat(u32(size), u32(size), new Uint8Array([8, 2, 0, 0, 0]));
	const idat = await deflate(raw);
	return concat(PNG_SIG, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', new Uint8Array(0)));
}

function solidRgba(size: number, [r, g, b]: Rgb): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	for (let i = 0; i < data.length; i += 4) {
		data[i] = r;
		data[i + 1] = g;
		data[i + 2] = b;
		data[i + 3] = 255;
	}
	return data;
}

export function encodeSolidJpeg(size: number, rgb: Rgb): Uint8Array {
	const { data } = jpegEncode({ data: solidRgba(size, rgb), width: size, height: size }, 92);
	return new Uint8Array(data);
}

let webpReady = false;

export async function encodeSolidWebp(size: number, rgb: Rgb): Promise<Uint8Array> {
	if (!webpReady) {
		await initWebp(WEBP_ENC_WASM);
		webpReady = true;
	}
	const image = {
		data: solidRgba(size, rgb),
		width: size,
		height: size,
	} as ImageData;
	const buf = await encodeWebp(image, { quality: 92 });
	return new Uint8Array(buf);
}
