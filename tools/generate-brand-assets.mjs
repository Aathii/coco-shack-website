/**
 * Generates favicons, app icons and the social-share image into /public.
 * Run after changing the brand mark or the booth photo:  npm run brand-assets
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const INK = '#0f0d0b';
const CLAY = '#e3b27e';

// Same coconut mark as src/components/ui/icons.ts (24px grid).
const MARK =
	'<path d="M4.8 11.2c0 5 3.1 9.3 7.2 9.3s7.2-4.3 7.2-9.3"/><ellipse cx="12" cy="11.2" rx="7.2" ry="2.1"/><path d="M13.4 10.4 17 3.5h2.6"/><path d="M8.4 14.4c.3 1.7 1 3 2 3.9M15.6 14.4c-.3 1.7-1 3-2 3.9"/>';

function iconSvg({ size, radius, padding, stroke }) {
	const scale = (size * (1 - padding * 2)) / 24;
	const offset = size * padding;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${INK}"/><g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="${CLAY}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${MARK}</g></svg>`;
}

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** Packs PNG images into a .ico container (PNG-in-ICO, supported by all modern browsers). */
function toIco(images) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(images.length, 4);
	let offset = 6 + images.length * 16;
	const entries = images.map(({ size, data }) => {
		const entry = Buffer.alloc(16);
		entry.writeUInt8(size >= 256 ? 0 : size, 0);
		entry.writeUInt8(size >= 256 ? 0 : size, 1);
		entry.writeUInt8(0, 2);
		entry.writeUInt8(0, 3);
		entry.writeUInt16LE(1, 4);
		entry.writeUInt16LE(32, 6);
		entry.writeUInt32LE(data.length, 8);
		entry.writeUInt32LE(offset, 12);
		offset += data.length;
		return entry;
	});
	return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
}

// Favicons: a heavier stroke keeps the mark legible at 16px.
const faviconSvg = iconSvg({ size: 64, radius: 14, padding: 0.12, stroke: 2.1 });
await writeFile(path.join(publicDir, 'favicon.svg'), faviconSvg);
await writeFile(
	path.join(publicDir, 'favicon.ico'),
	toIco(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(faviconSvg, size) })))),
);

// iOS masks its own rounded corners, so the touch icon is a full square.
await writeFile(path.join(publicDir, 'apple-touch-icon.png'), await png(iconSvg({ size: 180, radius: 0, padding: 0.2, stroke: 1.6 }), 180));
await writeFile(path.join(publicDir, 'icon-192.png'), await png(iconSvg({ size: 192, radius: 42, padding: 0.18, stroke: 1.6 }), 192));
await writeFile(path.join(publicDir, 'icon-512.png'), await png(iconSvg({ size: 512, radius: 112, padding: 0.18, stroke: 1.5 }), 512));
// Maskable icons need the artwork inside the central safe zone.
await writeFile(path.join(publicDir, 'icon-maskable-512.png'), await png(iconSvg({ size: 512, radius: 0, padding: 0.28, stroke: 1.5 }), 512));

// Social-share image: the real booth, framed on the signage and coconut crates.
const photo = sharp(path.join(root, 'src/assets/booth.jpg'));
const { width = 0, height = 0 } = await photo.metadata();
const cropHeight = Math.round(width / (1200 / 630));
const cropTop = Math.min(Math.max(Math.round(height * 0.69 - cropHeight / 2), 0), height - cropHeight);
await photo
	.extract({ left: 0, top: cropTop, width, height: cropHeight })
	.resize(1200, 630)
	.modulate({ saturation: 1.05 })
	.jpeg({ quality: 84, mozjpeg: true })
	.toFile(path.join(publicDir, 'og-image.jpg'));

console.log('Brand assets written to /public');
