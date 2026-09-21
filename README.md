# Pettitt Wealth — static website

A fully static site (no back end, no build tooling required) for GitHub Pages.

## Folder layout

- `docs/` — the finished site. Point GitHub Pages at the `docs` folder
  (repo Settings → Pages → Source: *Deploy from a branch* → branch `main`, folder `/docs`).
- `build.py` — optional generator. All page copy, contact details and the nav live in this
  one file; run `python3 build.py` to regenerate `docs/*.html`. You can also just edit the
  HTML files in `docs/` directly and never touch the generator.
- `docs/assets/css/style.css` — brand theme (colors, fonts, layout).
- `docs/assets/js/main.js` — mobile nav, scroll reveal, and the appointment form.
- `docs/assets/img/` — logos (gold / navy / white), favicons, headshots, FINRA badge.
- `docs/tools/app.js` — the compiled interactive Clock and Compass pages (React, CSS inlined).
- `docs/tools/widgets.js` — smaller bundle that powers the live Clock, Compass and seven-step
  wheel on the home page (`<div data-widget="clock|compass|planning-wheel|six-stages" data-theme="dark|light">`).
  `docs/clock.html` and `docs/compass.html` are thin wrappers that mount them.
- `tools/` — source for that bundle (React + Vite). Only needed if you want to change the
  Clock / Compass pages themselves:
  `cd tools && npm install && npm run build` rewrites `docs/tools/`. `tools/rebrand.py` is the
  one-time color / copy substitution that was applied to the original components.

## Clock & Compass notes

- Everything runs in the browser. Simulator inputs are saved in the visitor's `localStorage`
  (key `pettitt-compass-inputs`), not on any server.
- The Clock's "Live Stance" (currently *Approaching Recession*) is hard-coded text in
  `tools/src/pages/AssetManagement.jsx` and `tools/src/components/Visuals/TacticalSignalDashboard.jsx`;
  update it there and rebuild when the reading changes.
- The old lead-capture form and stock ticker were removed (they needed a back end / live data).

## Scheduling

"Schedule an Appointment" opens the visitor's email client with a pre-filled message to
`eric@pettittwealth.com`. Change the address in `SITE["email"]` in `build.py` (or search /
replace in the HTML + `main.js`).

## Before going live

1. Set `SITE["url"]` in `build.py` to the real domain (used for canonical tags, sitemap, OG image)
   and rebuild. If you use a custom domain on GitHub Pages, add a `CNAME` file in `docs/`.
2. Have compliance review the copy and the footer disclosures.
3. Replace the AI-generated headshots in `docs/assets/img/` if desired (keep the file names).
