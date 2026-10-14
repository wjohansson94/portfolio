# Wilhelm Johansson | Profile

A small static portfolio built with plain HTML, CSS and JavaScript (no build step). It shows a profile page and five interactive browser apps: a to-do list, a GitHub profile finder, a memory match game, a weather app and a helpdesk ticket tracker. I'm still learning, and the site is written to reflect that honestly.

## Live site

- [Profile page](https://wjohansson94.github.io/portfolio/)
- [To-do list demo](https://wjohansson94.github.io/portfolio/todo.html)
- [GitHub profile finder demo](https://wjohansson94.github.io/portfolio/github.html)
- [Memory match game](https://wjohansson94.github.io/portfolio/memory-game.html)
- [Weather app](https://wjohansson94.github.io/portfolio/weather.html)
- [Helpdesk tickets](https://wjohansson94.github.io/portfolio/helpdesk.html)

## Overview

### 1. Portfolio page
- sticky anchor navigation (Projects / Stack / Learning / Contact) with a skip link; smooth scrolling is disabled when `prefers-reduced-motion` is set
- dark/light theme toggle that follows `prefers-color-scheme` and remembers the choice in `localStorage` (shared by every page via `theme.js` and `theme.css`)
- project cards with a short "What I learned" note and a "Challenge", based on each project's code
- a grouped stack section (Front-end, Tools, Other) that makes clear what is still being learned
- a "My learning journey" timeline with dates and a next goal
- compact certificate cards and a compact "Courses in progress" block (Mimo progress is maintained manually in `index.html`: update the percentage, `aria-valuenow`, fill width and date together)
- Open Graph / Twitter / description meta tags, WebP images with width/height and lazy loading
- transparent attribution of GitHub Copilot as an AI coding assistant

### 2. JavaScript to-do list
Add, edit, complete and delete tasks; filter, search and sort; optional due dates with overdue highlighting; tasks persist in `localStorage`.

### 3. GitHub repository explorer
Searches a public GitHub user, shows profile details, loads repositories incrementally with local pagination, filters by language, sorts, saves favorites in `localStorage`, and handles loading, empty, timeout, network, not-found and rate-limit states.

### 4. Memory match
Three difficulty levels, move counter, timer and personal bests per difficulty.

### 5. Weather app
Uses the free, no-key [Open-Meteo](https://open-meteo.com/) geocoding and forecast APIs:

- city search (with other matching places to choose from)
- current conditions and a 7-day forecast
- °C / °F toggle (remembered)
- "My location" button using the browser geolocation API
- last 5 searches in `localStorage`, with a clear button
- loading and error states announced through `aria-live` regions

### 6. Helpdesk tickets
A ticket tracker inspired by IT support work, built with vanilla JavaScript:

- create tickets with title, description, requester, category (Hardware / Software / Network / Account) and priority (Low / Medium / High / Critical)
- IDs such as `HD-001` that are never reused after a delete
- status workflow Open → In progress → Resolved → Closed (with "Reopen")
- edit, delete (with confirmation) and timestamped notes per ticket
- search, filters by status / priority / category, sorting, and counters per status
- tickets saved in `localStorage` (read with `try/catch` and validated before use)
- export to JSON, and clearly labelled sample tickets that can be loaded and removed
- empty and error states, `aria-live` announcements and focus management after changes
- user text is always inserted with `textContent`, never `innerHTML`

## Project structure

- `index.html`, `style.css` — portfolio page
- `theme.js`, `theme.css` — shared dark/light theme
- `certificate-viewer.html/.js` — certificate viewer
- `todo.html/.css/.js`, `github.html/.css/.js`, `memory-game.html/.css/.js`, `weather.html/.css/.js`, `helpdesk.html/.css/.js` — the apps
- `*.webp`, `profile.jpg`, `favicon.*` — images (`profile.jpg` is kept for the social preview image)
- `certificates/` — certificate images (WebP for the page, PNG/JPEG/PDF originals)
- `scripts/check-links.mjs` — relative link checker used in CI
- `.github/workflows/validate.yml`, `.htmlvalidate.json` — CI configuration

## Getting started

No build or install needed. Serve the folder with any static server, for example `python -m http.server`, and open `http://localhost:8000`. (Opening files directly also works, but `fetch` calls are more reliable over HTTP.)

## Checks

On every push to `main` and every pull request, GitHub Actions runs [html-validate](https://html-validate.org/) on all HTML files and `scripts/check-links.mjs`, which checks relative links, images, scripts and `#anchors`. To run them locally:

```
npx html-validate@9 *.html
node scripts/check-links.mjs
```

## Deployment

Published with GitHub Pages as static files.

## Skills practiced

- semantic HTML, accessibility and responsive CSS
- DOM manipulation, state and timers in vanilla JavaScript
- browser storage with `localStorage`
- consuming public REST APIs (GitHub, Open-Meteo) with async/await and error handling
- theming with CSS variables and `prefers-color-scheme`
