#!/usr/bin/env node
/**
 * Generates PNG and favicon from SVG logos.
 * Run: node scripts/generate-logo-png.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const brandDir = join(__dirname, "..", "public", "brand");

async function main() {
  // logo.svg (horizontal) -> logo.png (2x for retina: 440x80)
  const logoSvg = readFileSync(join(brandDir, "logo.svg"));
  await sharp(logoSvg)
    .resize(440, 80)
    .png()
    .toFile(join(brandDir, "logo.png"));

  // logo-icon.svg -> favicon.png (64x64 square)
  const iconSvg = readFileSync(join(brandDir, "logo-icon.svg"));
  await sharp(iconSvg)
    .resize(64, 64)
    .png()
    .toFile(join(brandDir, "favicon.png"));

  console.log("✓ Generated logo.png and favicon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
