/* Renders the brand mark to the PNG sizes the PWA manifest needs.
   Run: node scripts/gen-icons.mjs  (requires sharp) */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const PUBLIC = new URL("../public/", import.meta.url);
await mkdir(PUBLIC, { recursive: true });

// Standard icon: mark fills ~64% of frame on the brand-dark background.
const icon = (size, { maskable = false } = {}) => {
  const pad = maskable ? size * 0.2 : size * 0.16; // safe zone for maskable
  const inner = size - pad * 2;
  const s = inner / 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" fill="#0c0f1a"/>
  <g transform="translate(${pad} ${pad}) scale(${s})">
    <rect x="2.5" y="2.5" width="27" height="27" rx="6" fill="none" stroke="#5cd6f5" stroke-opacity="0.4" stroke-width="1.1"/>
    <path d="M5 17h4l2.5-7 4 13 3-9 2 3h6.5" fill="none" stroke="#5cd6f5" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
};

const targets = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  ["icon-maskable.png", 512, { maskable: true }],
  ["apple-touch-icon.png", 180, {}],
];

for (const [name, size, opts] of targets) {
  await sharp(Buffer.from(icon(size, opts)))
    .png()
    .toFile(new URL(name, PUBLIC).pathname);
  console.log("wrote", name);
}
