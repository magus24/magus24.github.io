import { chromium } from 'playwright'
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', 'dist')
const shots = path.resolve(here, '..', 'shots')
mkdirSync(shots, { recursive: true })

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
}

const server = http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (pathname.startsWith('/portfolio/')) pathname = pathname.slice('/portfolio'.length)
    if (pathname === '/') pathname = '/index.html'
    const file = path.join(root, pathname)
    const data = await readFile(file)
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('not found')
  }
})

await new Promise((resolve) => server.listen(4173, resolve))

const report = { console: [], pageErrors: [], failedRequests: [], badResponses: [] }

async function attach(page) {
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      if (msg.text().includes('THREE.Clock')) return
      report.console.push(`[${msg.type()}] ${msg.text()}`)
    }
  })
  page.on('pageerror', (err) => report.pageErrors.push(String(err)))
  page.on('requestfailed', (req) =>
    report.failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`),
  )
  page.on('response', (res) => {
    if (res.status() >= 400) report.badResponses.push(`${res.status()} ${res.url()}`)
  })
}

const overflow = (page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )

const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await chromium.launch({ executablePath: CHROME })

/* ---------- desktop ---------- */
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await desktop.newPage()
attach(page)
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)

report.webgl = await page.evaluate(() => {
  const canvas = document.querySelector('.core-stage canvas')
  if (!canvas) return 'no canvas'
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  return gl ? `ok (${canvas.width}x${canvas.height})` : 'no context'
})
report.heroName = await page.textContent('.hero-name')
report.overflowDesktop = await overflow(page)
report.fonts = await page.evaluate(() => document.fonts.check('16px "Space Grotesk Variable"'))
report.coreCanvasCount = await page.locator('.core-stage canvas').count()

/* language switch: force EN (detected may be ru on this machine), then EN->RU with fade, then back to EN */
report.langInlineVisible = await page.locator('.lang-switch--inline').isVisible()
await page.click('.lang-switch--inline button[aria-label="English"]')
await page.waitForTimeout(900)
report.enHtml = await page.getAttribute('html', 'lang')
await page.screenshot({ path: path.join(shots, '00-en.png') })
await page.click('.lang-switch--inline button[aria-label="Русский"]')
await page.waitForTimeout(60)
report.fadeDuringSwitch = await page.evaluate(() => {
  const el = document.querySelector('.app')
  return el ? el.classList.contains('app-fade') : null
})
await page.waitForTimeout(900)
report.fadeGone = await page.evaluate(() => {
  const el = document.querySelector('.app')
  return el ? el.classList.contains('app-fade') : null
})
report.ruHtmlLang = await page.getAttribute('html', 'lang')
report.ruTitle = await page.title()
report.ruStorage = await page.evaluate(() => localStorage.getItem('portfolio-language'))
report.ruCoreCanvas = await page.locator('.core-stage canvas').count()
await page.screenshot({ path: path.join(shots, '00-ru.png') })
await page.click('.lang-switch--inline button[aria-label="English"]')
await page.waitForTimeout(900)
report.enBack = await page.getAttribute('html', 'lang')

await page.screenshot({ path: path.join(shots, '01-hero.png') })

/* command palette via / */
await page.keyboard.press('/')
await page.waitForTimeout(600)
report.commandVisible = await page.locator('.cmd-panel').isVisible()
await page.screenshot({ path: path.join(shots, '02-command.png') })
await page.keyboard.press('Escape')
await page.waitForTimeout(400)

/* guide via ? */
await page.keyboard.press('?')
await page.waitForTimeout(600)
report.guideVisible = await page.locator('.guide-panel').isVisible()
await page.screenshot({ path: path.join(shots, '03-guide.png') })
await page.keyboard.press('Escape')
await page.waitForTimeout(400)

/* fullscreen menu */
await page.click('.header-status')
await page.waitForTimeout(900)
report.menuLinks = await page.locator('.menu-link').count()
await page.screenshot({ path: path.join(shots, '04-menu.png') })
await page.keyboard.press('Escape')
await page.waitForTimeout(600)

/* work */
await page.evaluate(() => document.getElementById('work')?.scrollIntoView())
await page.waitForTimeout(1600)
await page.screenshot({ path: path.join(shots, '05-work.png') })

/* open case study */
await page.click('.project-row .bracket-link >> nth=0')
await page.waitForTimeout(1400)
report.caseVisible = await page.locator('.case-overlay').isVisible()
await page.screenshot({ path: path.join(shots, '06-case.png') })
await page.keyboard.press('Escape')
await page.waitForTimeout(700)

/* experiments */
await page.evaluate(() => document.getElementById('experiments')?.scrollIntoView())
await page.waitForTimeout(1300)
await page.hover('.exp-row >> nth=3')
await page.waitForTimeout(800)
report.expStageText = await page.textContent('.exp-stage .stage-desc')
await page.screenshot({ path: path.join(shots, '07-experiments.png') })

/* story chapters */
await page.evaluate(() => document.getElementById('idea')?.scrollIntoView())
await page.waitForTimeout(1700)
await page.screenshot({ path: path.join(shots, '08-idea.png') })

await page.evaluate(() => document.getElementById('transfer')?.scrollIntoView())
await page.waitForTimeout(2200)
await page.screenshot({ path: path.join(shots, '09-transfer.png') })

await page.evaluate(() => document.getElementById('ai')?.scrollIntoView())
await page.waitForTimeout(1900)
await page.screenshot({ path: path.join(shots, '10-ai.png') })

await page.evaluate(() => document.getElementById('execution')?.scrollIntoView())
await page.waitForTimeout(1900)
await page.screenshot({ path: path.join(shots, '11-execution.png') })

/* about */
await page.evaluate(() => document.getElementById('about')?.scrollIntoView())
await page.waitForTimeout(1400)
await page.screenshot({ path: path.join(shots, '12-about.png') })

/* contact */
await page.evaluate(() => document.getElementById('contact')?.scrollIntoView())
await page.waitForTimeout(1400)
await page.screenshot({ path: path.join(shots, '13-contact.png') })

/* full page */
await page.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.6)
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 120))
  }
  window.scrollTo(0, 0)
})
await page.waitForTimeout(1700)
await page.screenshot({ path: path.join(shots, '14-full.png'), fullPage: true })

/* ---------- laptop ---------- */
const laptop = await browser.newContext({ viewport: { width: 1024, height: 700 } })
const lp = await laptop.newPage()
attach(lp)
await lp.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await lp.waitForTimeout(2600)
report.overflow1024 = await overflow(lp)
await lp.screenshot({ path: path.join(shots, '15-laptop.png') })

/* ---------- tablet ---------- */
const tablet = await browser.newContext({ viewport: { width: 768, height: 1024 } })
const tp = await tablet.newPage()
attach(tp)
await tp.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await tp.waitForTimeout(2600)
report.overflow768 = await overflow(tp)
await tp.screenshot({ path: path.join(shots, '16-tablet.png') })

/* ---------- mobile ---------- */
const mobile = await browser.newContext({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
})
const mp = await mobile.newPage()
attach(mp)
await mp.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await mp.waitForTimeout(3000)
report.overflow375 = await overflow(mp)
await mp.screenshot({ path: path.join(shots, '17-mobile-hero.png') })

report.langPopVisible = await mp.locator('.lang-switch--pop').isVisible()
report.langInlineHidden = await mp.locator('.lang-switch--inline').isHidden()

await mp.tap('.header-status')
await mp.waitForTimeout(900)
await mp.screenshot({ path: path.join(shots, '16-mobile-menu.png') })
await mp.tap('.menu-link >> nth=0')
await mp.waitForTimeout(1800)
await mp.screenshot({ path: path.join(shots, '17-mobile-work.png') })

await mp.evaluate(() => document.getElementById('contact')?.scrollIntoView())
await mp.waitForTimeout(1300)
await mp.screenshot({ path: path.join(shots, '18-mobile-contact.png') })

/* ---------- 320px ---------- */
const tiny = await browser.newContext({
  viewport: { width: 320, height: 640 },
  isMobile: true,
  hasTouch: true,
})
const tinyPage = await tiny.newPage()
attach(tinyPage)
await tinyPage.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await tinyPage.waitForTimeout(2600)
report.overflow320 = await overflow(tinyPage)
await tinyPage.screenshot({ path: path.join(shots, '19-320.png') })

/* ---------- reduced motion ---------- */
const reducedCtx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
})
const rp = await reducedCtx.newPage()
attach(rp)
await rp.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await rp.waitForTimeout(2000)
report.reducedOverflow = await overflow(rp)
await rp.screenshot({ path: path.join(shots, '20-reduced.png') })
report.reducedErrors = report.pageErrors.length

await browser.close()
server.close()

console.log(JSON.stringify(report, null, 2))