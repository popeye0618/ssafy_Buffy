import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome' })
const source = await readFile(new URL('../public/brand/buffy-app-icon.svg', import.meta.url), 'utf8')
for (const [name, size] of [
  ['buffy-icon-192x192.png', 192],
  ['buffy-icon-512x512.png', 512],
  ['buffy-maskable-512x512.png', 512],
  ['buffy-apple-touch-icon.png', 180],
]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
  const background = name.includes('maskable') ? '#14406F' : 'transparent'
  await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${background}}svg{display:block;width:100%;height:100%}</style>${source}`)
  await page.screenshot({ path: `public/brand/${name}` })
  await page.close()
}
await browser.close()
