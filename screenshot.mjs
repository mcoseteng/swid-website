import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3];
const delay = Number(process.env.DELAY || 0);
const dir = join(process.cwd(), 'temporary screenshots');

await mkdir(dir, { recursive: true });
const n = (await readdir(dir)).map(f => +(f.match(/^screenshot-(\d+)/)?.[1] || 0)).reduce((a, b) => Math.max(a, b), 0) + 1;
const out = join(dir, `screenshot-${n}${label ? `-${label}` : ''}.png`);

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: Number(process.env.W || 1440), height: Number(process.env.H || 900) });
await page.goto(url, { waitUntil: 'networkidle0' });
if (delay) await new Promise(r => setTimeout(r, delay));
if (process.env.SCROLL) {
  await page.evaluate(y => scrollTo(0, y), Number(process.env.SCROLL));
  await new Promise(r => setTimeout(r, 300));
}
await page.screenshot({ path: out });
await browser.close();
console.log(out);
