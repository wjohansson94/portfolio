# Wilhelm Johansson | Profile

A small static portfolio built with plain HTML, CSS and JavaScript (no build step). It shows a profile page and eleven interactive browser apps: a to-do list, a GitHub profile finder, a memory match game, a weather app, a helpdesk ticket tracker, an IT & security quiz, a password checker/generator, a word guessing game, a Pomodoro timer, an expense tracker and flashcards (the last two typed in by hand in VS Code while following step-by-step guidance from an AI assistant). I'm still learning, and the site is written to reflect that honestly.

## Live site

- [Profile page](https://wjohansson94.github.io/portfolio/)
- [To-do list demo](https://wjohansson94.github.io/portfolio/todo.html)
- [GitHub profile finder demo](https://wjohansson94.github.io/portfolio/github.html)
- [Memory match game](https://wjohansson94.github.io/portfolio/memory-game.html)
- [Weather app](https://wjohansson94.github.io/portfolio/weather.html)
- [Helpdesk tickets](https://wjohansson94.github.io/portfolio/helpdesk.html)
- [IT & security quiz](https://wjohansson94.github.io/portfolio/quiz.html)
- [Password checker & generator](https://wjohansson94.github.io/portfolio/password.html)
- [Word guess game](https://wjohansson94.github.io/portfolio/wordle.html)
- [Pomodoro timer](https://wjohansson94.github.io/portfolio/pomodoro.html)
- [Expense tracker](https://wjohansson94.github.io/portfolio/expenses.html)
- [Flashcards](https://wjohansson94.github.io/portfolio/flashcards.html)

## Overview

### 1. Portfolio page
- hero headline "My front-end learning journey" with a beginner-honest intro (React and TypeScript are listed as curiosities, not started), plus links to the projects and contact
- sticky anchor navigation (Projects / About / Path / Stack / Learning / Contact) with a skip link; smooth scrolling is disabled when `prefers-reduced-motion` is set. On small screens the header is not sticky, so it does not cover the page
- dark/light theme toggle that follows `prefers-color-scheme` and remembers the choice in `localStorage` (shared by every page via `theme.js` and `theme.css`)
- compact project cards in a 3/2/1-column grid: thumbnail, one-line summary, tech chips, "Live demo" and "Code" buttons, and a collapsible "What I learned" / "Challenge" note based on each project's code. The first four projects are shown; the rest sit behind a "Show all projects" button (all are visible if JavaScript is off)
- an "About this journey" section: two short panels ("What I'm practising now" and "How I learn": guided by an AI assistant and courses, typed and debugged by me, with the AI help stated openly) and a five-step "My project routine" strip
- a "My learning path" roadmap with five steps. Steps 1 and 2 (HTML & CSS; JavaScript, APIs & Git) are highlighted as what I'm working on now (`aria-current="step"`), step 3 (bigger projects) is "Next", and steps 4 and 5 (React & TypeScript; better structure) are curiosities for later. Status is written out as text and shown with border style, not colour alone. Below it: what I'm building and what I'd like to explore
- a stack section grouped as "Use in my projects" and "Learning next" (dashed outline), making clear what is still being learned
- a "My learning journey" timeline with dates and a next goal
- compact certificate cards and a compact "Courses in progress" block (Mimo progress is maintained manually in `index.html`: update the percentage, `aria-valuenow`, fill width and date together). A "Projects from the Mimo course" group lists small projects built during that course (first: "My Linktree Project", then "Unit Converter", both hosted on Mimo; they are not part of the eleven main projects). A separate "Planned courses & certifications" group lists courses I have not started (JavaScript Essentials 1 / JSE and Web Dev 101: HTML / WDE from Edube and JS Institute), labelled "Planned" with no progress bar
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
A ticket tracker modelled on how IT help desks work, built with vanilla JavaScript:

- create tickets with title, description, requester, category (Hardware / Software / Network / Account) and priority (Low / Medium / High / Critical)
- IDs such as `HD-001` that are never reused after a delete
- status workflow Open → In progress → Resolved → Closed (with "Reopen")
- edit, delete (with confirmation) and timestamped notes per ticket
- search, filters by status / priority / category, sorting, and counters per status
- tickets saved in `localStorage` (read with `try/catch` and validated before use)
- export to JSON, and clearly labelled sample tickets that can be loaded and removed
- empty and error states, `aria-live` announcements and focus management after changes
- user text is always inserted with `textContent`, never `innerHTML`

### 7. IT & security quiz
A quiz with 40 questions and explanations (beginner and intermediate) created with an AI assistant and reviewed and studied by me:

- six categories: phishing, passwords & access, networking, Windows & Microsoft 365, data & security basics, IT support practice
- choose category, level and number of questions; questions and answers are shuffled
- one question at a time with keyboard-operable radio buttons, instant feedback and a short explanation (right/wrong is shown with text as well as colour)
- progress bar and an optional 30-second timer per question
- results with a review of wrong answers
- best score and per-category stats saved in `localStorage` (read with `try/catch` and validated), with a reset button
- the explanations are study notes, not official training

### 8. Password checker & generator
A privacy-friendly tool that runs entirely in the browser (nothing is sent, stored or logged):

- live strength meter and an entropy estimate based on length, character variety, a small built-in common-password list, and simple checks for repeats, sequences and keyboard walks
- a clearly labelled, rough crack-time estimate (assumes 10 billion guesses per second against a fast hash; it is a worst-case guess, not a promise)
- feedback on what to improve, a show/hide toggle, and `aria-live` strength announcements
- generator using `crypto.getRandomValues` (never `Math.random`) with rejection sampling to avoid bias: length slider, character sets, option to avoid look-alike characters, and a passphrase mode with a built-in wordlist
- copy to clipboard with a fallback and feedback
- a short security tips section (unique passwords, password manager, MFA/passkeys)
- limits: it does not check breach databases and does not recognise every dictionary word or personal detail

### 9. Word guess game
A five-letter word guessing game (a small learning project built with AI assistance, not affiliated with any other game):

- six attempts, a built-in answer list and a larger list of accepted guesses (so some real words may be rejected)
- on-screen keyboard and physical keyboard support
- repeated letters follow the real rules (a letter is only marked as many times as it is still unused in the answer); the scoring is a small pure function covered by tests in `tests/`
- not colour only: every tile state also has a symbol and an `aria-label`, plus an optional high-contrast colour mode
- flip animation that is skipped with `prefers-reduced-motion`; results, invalid words and "too short" messages are announced through an `aria-live` region
- win/lose dialog with the answer, and a copyable emoji grid
- random word or a "word of the day" derived from the date (no server)
- statistics (played, win %, streaks, guess distribution) saved in `localStorage`, read with `try/catch` and validated

### 10. Pomodoro timer
A focus/break timer:

- focus, short break and long break modes with configurable durations (defaults 25/5/15, long break after 4 focus rounds)
- start, pause, reset and skip; keyboard shortcuts (`Space`, `R`, `S`) that are documented on the page
- time left is calculated from an end timestamp (`Date.now`), not by counting ticks, so it stays correct in background tabs; the logic is pure functions covered by tests in `tests/`
- SVG progress ring and the remaining time in the page title
- `aria-live` announcements only when the mode changes or the timer starts/pauses, not every second
- today's finished focus rounds and focus minutes plus settings saved in `localStorage` (read with `try/catch` and validated)
- optional Web Audio beep (no sound files) and optional browser notification; both are off by default and permission is only requested when the box is ticked

### 11. Expense tracker
Typed in by hand in VS Code while following step-by-step guidance from an AI assistant; I fixed my own typos and bugs along the way:

- add an expense with description, amount, category and date; delete single expenses
- total and per-category totals worked out with `reduce`; deleting uses `filter`
- expenses saved in `localStorage` (read with `try/catch`)
- doughnut chart of spending per category with [Chart.js](https://www.chartjs.org/), my first library. It is loaded from the jsdelivr CDN, so the chart needs an internet connection; the rest of the page works without it. The chart legend is redrawn when the theme changes
- labelled form fields, native validation (`required`, `min`), a per-item Delete button label and a `role="status"` total

### 12. Flashcards
Typed in by hand in VS Code while following step-by-step guidance from an AI assistant; I fixed my own typos and bugs along the way:

- add question/answer cards, flip a card to see the answer, mark it "Knew it" or "Didn't know" and move to the next card (the list loops around with `%`)
- cards saved in `localStorage`; loaded data is checked with `isValidCard` and `filter` inside `try/catch`
- labelled inputs, buttons disabled when there are no cards, `aria-live` counter, reduced-motion respected

## Project structure

- `index.html`, `style.css` — portfolio page
- `theme.js`, `theme.css` — shared dark/light theme
- `certificate-viewer.html/.js` — certificate viewer
- `todo.html/.css/.js`, `github.html/.css/.js`, `memory-game.html/.css/.js`, `weather.html/.css/.js`, `helpdesk.html/.css/.js`, `quiz.html/.css/.js`, `password.html/.css/.js`, `wordle.html/.css/.js`, `pomodoro.html/.css/.js`, `expenses.html/.css/.js`, `flashcards.html/.css/.js` — the apps
- `tests/` — Node tests for pure game logic (`node --test "tests/*.test.js"`)
- `*.webp`, `profile.jpg`, `favicon.*` — images (`profile.jpg` is kept for the social preview image)
- `certificates/` — certificate images (WebP for the page, PNG/JPEG/PDF originals)
- `scripts/check-links.mjs` — relative link checker used in CI
- `.github/workflows/validate.yml`, `.htmlvalidate.json` — CI configuration

## Getting started

No build or install needed. Serve the folder with any static server, for example `python -m http.server`, and open `http://localhost:8000`. (Opening files directly also works, but `fetch` calls are more reliable over HTTP.)

## Checks

On every push to `main` and every pull request, GitHub Actions runs [html-validate](https://html-validate.org/) on all HTML files and `scripts/check-links.mjs`, which checks relative links, images, scripts and `#anchors`, and the logic tests in `tests/`. To run them locally:

```
npx html-validate@9 *.html
node scripts/check-links.mjs
node --test "tests/*.test.js"
```

## Deployment

Published with GitHub Pages as static files.

## Skills practiced

- semantic HTML, accessibility and responsive CSS
- DOM manipulation, state and timers in vanilla JavaScript
- browser storage with `localStorage`
- consuming public REST APIs (GitHub, Open-Meteo) with async/await and error handling
- theming with CSS variables and `prefers-color-scheme`
