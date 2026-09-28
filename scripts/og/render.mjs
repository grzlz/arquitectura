// OG image: typeset the sheet in a browser, then photograph it in Blender.
// Usage: npm run og [-- <samples>]   (BLENDER=/path/to/blender if not on PATH)
// Writes static/og.jpg (2400×1260). The texture lands in scripts/og/.out/.
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, '.out');
const texture = path.join(outDir, 'sheet.png');
const target = path.join(here, '../../static/og.jpg');
const samples = process.argv[2] ?? '128';

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1580, height: 1000 },
	deviceScaleFactor: 3
});
await page.goto(`file://${path.join(here, 'sheet.html')}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: texture });
await browser.close();
console.log(`texture ${texture}`);

const blender = process.env.BLENDER ?? 'blender';
const run = spawnSync(
	blender,
	['-b', '--factory-startup', '-P', path.join(here, 'scene.py'), '--', texture, target, samples],
	{ stdio: 'inherit' }
);
if (run.status !== 0) process.exit(run.status ?? 1);
console.log(`rendered ${target}`);
