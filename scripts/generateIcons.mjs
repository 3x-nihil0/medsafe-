/**
 * Generates every icon and splash asset from the single source of truth,
 * public/icon.svg - so the app icon can never drift from the brand colour.
 *
 *   npm run icons
 *
 * Outputs:
 *   public/pwa-192x192.png            PWA icon
 *   public/pwa-512x512.png            PWA icon
 *   public/pwa-maskable-512x512.png   Android adaptive / maskable icon
 *   public/apple-touch-icon.png       iOS home-screen icon (180)
 *   public/favicon.png                browser tab icon (48)
 *   assets/icon.png                   input for @capacitor/assets (1024)
 *   assets/splash.png                 Android splash screen
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SOURCE = 'public/icon.svg';
const TEAL = '#0f766e';

mkdirSync('assets', { recursive: true });

const source = () => sharp(SOURCE);

async function write(path, image) {
  await image.png().toFile(path);
  console.log('✓', path);
}

// Plain icons
await write('public/pwa-192x192.png', source().resize(192, 192));
await write('public/pwa-512x512.png', source().resize(512, 512));
await write('public/favicon.png', source().resize(48, 48));

// iOS home-screen icon: solid background, no transparent corners
const appleIcon = await source().resize(180, 180).png().toBuffer();
await sharp({
  create: { width: 180, height: 180, channels: 4, background: TEAL }
})
  .composite([{ input: appleIcon }])
  .png()
  .toFile('public/apple-touch-icon.png');
console.log('✓', 'public/apple-touch-icon.png');

// Maskable icon: logo inside the 80% safe zone on a full-bleed background
const maskableLogo = await source().resize(400, 400).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: TEAL }
})
  .composite([{ input: maskableLogo, gravity: 'centre' }])
  .png()
  .toFile('public/pwa-maskable-512x512.png');
console.log('✓', 'public/pwa-maskable-512x512.png');

// Capacitor master icon (>= 1024px)
await write('assets/icon.png', source().resize(1024, 1024));

// Android splash: brand colour with a centred mark
const splashMark = await source().resize(360, 360).png().toBuffer();
await sharp({
  create: { width: 1284, height: 2778, channels: 4, background: TEAL }
})
  .composite([{ input: splashMark, gravity: 'centre' }])
  .png()
  .toFile('assets/splash.png');
console.log('✓', 'assets/splash.png');

console.log('\nAll icons generated from', SOURCE);
