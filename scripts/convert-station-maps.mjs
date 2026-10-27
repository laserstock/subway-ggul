// Converts public/station-maps/**/*.jpg to WebP (same name, .webp) and removes the JPG.
// Usage: node scripts/convert-station-maps.mjs
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "station-maps");

const files = (await readdir(ROOT, { recursive: true })).filter((file) => file.toLowerCase().endsWith(".jpg"));
let before = 0;
let after = 0;

for (const file of files) {
  const source = path.join(ROOT, file);
  const target = source.replace(/\.jpg$/i, ".webp");
  before += (await stat(source)).size;
  await sharp(source).webp({ quality: 82, effort: 6 }).toFile(target);
  after += (await stat(target)).size;
  await unlink(source);
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
console.log(`${files.length} maps: ${mb(before)} MB → ${mb(after)} MB`);
