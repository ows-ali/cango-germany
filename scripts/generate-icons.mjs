import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(__dirname, "..", "public", "icons", "icon.png");
const outDir = resolve(__dirname, "..", "public", "icons");

const sizes = [
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  const outputPath = resolve(outDir, name);
  await sharp(sourcePath).resize(size, size).png().toFile(outputPath);
  console.log(`Generated ${name} (${size}x${size})`);
}

console.log("Done!");
