# AI Traffic Intelligence — WIUT Hackathon 2026 Website

Team site for the **CV Track**: one long-scroll page covering the approach, the
measured results, the event catalogue, a live demo and the report. Built with
**Next.js 16 (App Router)** + **Tailwind CSS v4**, with an **English ⇄ Uzbek**
switch.

The site is deployed as a **static export on GitHub Pages**. The inference
backend is a separate FastAPI service, because Pages has no server runtime.

---

## Sections (all mandatory rubric items)

| Section | Component | Notes |
| --- | --- | --- |
| Hero | `Hero.tsx` | Tagline, CTA, per-class readiness badges |
| Team | `Team.tsx` | Member cards — **roster still TODO in `lib/data.ts`** |
| Problem & Approach | `Problem.tsx`, `Approach.tsx` | Pipeline, learned vs rule-based, models & datasets |
| EDA | `Eda.tsx` | Video specs, event-over-time, risk profile, lane directions |
| Sample Video Results | `Results.tsx` | Per-video result cards + failure cases |
| **Live Demo** | `LiveDemo.tsx` | MP4 upload, progress, click-to-seek timeline, risk curve |
| Report | `Report.tsx` | Structure of the written report |
| Links | `Links.tsx` | Repo, weights, predictions, team links |

All copy lives in `lib/translations.ts` (EN + UZ dictionaries). Adding a key in
one language requires a matching key in the other.

## Where the numbers come from

`lib/data.ts` is **generated**, not hand-written:

```bash
python ../tools/gen_site_data.py     # run from the parent directory
```

It reads the organizers' harness output (`predictions_samples.json`), the
calibrated `scene_config.json` and a cv2 probe of the four sample clips, then
emits `lib/data.ts`. The only hand-written block left is `TEAM`.

Anything that is an illustration rather than a measurement is labelled
"schematic" in the UI — we have no per-pixel motion field, so a real heatmap
would be a fabrication.

## Getting started

Requires Node 20+ (developed with Node 24).

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build as a static export (what Pages runs):

```bash
NEXT_OUTPUT=export npm run build     # -> out/
```

## Live Demo wiring

There is **no API route any more**. GitHub Pages serves files only, so a
Next.js route handler would exist on Vercel and 404 on Pages. The browser
therefore posts straight to the FastAPI backend:

- set `NEXT_PUBLIC_API_BASE` to the backend origin (e.g. `http://localhost:8000`)
  and the demo runs real inference;
- leave it unset and the UI says plainly that the backend is not deployed, with
  the command to start it. It does **not** return a fabricated 200 response.

```bash
# PowerShell
$env:NEXT_PUBLIC_API_BASE = "http://localhost:8000"
npm run dev
```

The backend must allow the site's origin (`backend/main.py` sends
`Access-Control-Allow-Origin: *` for the demo). Error codes are shared with
`backend/main.py`: `noFile` (400), `wrongFormat` (400), `tooLarge` (413),
`tooLong` (422), `processing` (500), `server` (fallback).

> The backend does the authoritative validation (MP4, ≤ 100 MB, ≤ 2 min) and the
> authoritative inference: it imports the submitted `solution.py`, so the demo
> exercises the graded code rather than a re-implementation.

## Before publishing

- [ ] Fill `TEAM` in `lib/data.ts` (names, roles, links) — required by the rubric
- [ ] Set `LINKS.repository` / `weights` / `predictions` to the real URLs
- [ ] Set the repository variable `API_BASE_URL` for the Pages workflow
- [ ] Set `SITE_BASE_PATH` to `/<repo>` if this is a project page, empty for a
      user/organisation page

## Deployment

- **Site:** GitHub Actions → `.github/workflows/pages.yml` builds and deploys on
  every push to `main`. Configure it once with
  `gh api -X POST repos/:owner/:repo/pages -f build_type=workflow` (or
  Settings → Pages → Source → GitHub Actions). Two repository variables:
  `SITE_BASE_PATH` and `API_BASE_URL`.
- **Backend:** any host that runs Python and a GPU — Render, Railway, HF Spaces.
  `uvicorn main:app --host 0.0.0.0 --port 8000`.

## Stack

- Next.js 16 (App Router, React Server Components, **static export**)
- Tailwind CSS v4
- SVG-based custom charts (no chart library)
- FastAPI + OpenCV + the submitted `solution.py` for the Live Demo
