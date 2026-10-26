# Wilhelm Johansson | Profile

A small static portfolio built with plain HTML, CSS and JavaScript (no build step). It shows a profile page and twelve interactive browser apps: a to-do list, a GitHub profile finder, a memory match game, a weather app, a helpdesk ticket tracker, an IT & security quiz, a password checker/generator, a word guessing game, a Pomodoro timer, an expense tracker, flashcards and a TV show search (the last three typed in by hand in VS Code while following step-by-step guidance from an AI assistant). Most projects here were built with a lot of AI help (GitHub Copilot); I read and test the code to understand it, but I didn't write it unaided. I'm still learning, and the site is written to reflect that honestly.

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
- [Show search](https://wjohansson94.github.io/portfolio/shows.html)

## Overview

### 1. Portfolio page
- hero headline "IT enthusiast building front-end projects" framed as a hobby and a place to document learning, with "View projects" (violet accent) and "Contact" buttons that jump to the Projects and Contact sections, and small GitHub and LinkedIn links underneath. React and TypeScript (not started) are mentioned only under "Next goals"
- sticky anchor navigation (Projects / About / Learning / Contact) with a skip link; smooth scrolling is disabled when `prefers-reduced-motion` is set. On small screens the header is not sticky, so it does not cover the page
- dark/light theme toggle that follows `prefers-color-scheme` and remembers the choice in `localStorage` (shared by every page via `theme.js` and `theme.css`)
- three featured projects (Helpdesk tickets, Password checker & generator, Show search) shown prominently, and a compact "More projects" grid with the other nine main projects (including the Pomodoro timer) plus the three Mimo course projects (twelve main + three Mimo). The "More projects" grid sits behind a "Show all projects" button (all are visible if JavaScript is off)
- each project card has a thumbnail, one-line summary, tech chips, a small badge ("Built with AI", "AI-generated, typed by hand" for the Expense tracker, Flashcards and Show search, or "Built with Mimo"), "Live demo" and "Code" buttons, and a collapsible "What I understood" / "What was tricky to understand" note describing what I understood from each project's code (not a claim that I wrote it unaided)
- one "About & how I learn" section: two short panels ("What I use in my projects", a chip list of the tools and topics, still learning and not a claim of expertise; and "How I learn": guided by an AI assistant and courses, typed and debugged by me, with the AI help stated openly), a five-step "My project routine" strip, and a "Next goals" list of two one-liners (React and TypeScript not started; JavaScript Essentials 1 / JSE and Web Dev 101: HTML / WDE from Edube and JS Institute are planned, not started, with links)
- a "Certificates & courses" section: the four certificates as a compact list, each with a text "Completed" badge and a "View certificate" link to `certificate-viewer.html`, and a compact "Courses in progress" block with an "In progress" badge (Mimo progress is maintained manually in `index.html`: update the percentage, `aria-valuenow`, fill width and date together). The small projects built during the Mimo course ("My Linktree Project", "Unit Converter" and "Coffee Shop Menu", all hosted on Mimo) are listed as compact cards under "More projects" with a "Built with Mimo" badge; they are not part of the twelve main projects
- a "Want to follow my journey? Let's connect." contact section: prominent violet GitHub and LinkedIn buttons plus an outlined Email button (the existing email address), and Instagram, Threads and Bluesky as smaller icon links under "Also find me on"
- Open Graph / Twitter (`summary_large_image`, with a 1200×630 share image and alt text) / description meta tags, WebP images with width/height and lazy loading
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
- doughnut chart of spending per category with [Chart.js](https://www.chartjs.org/), my first library. Chart.js 4.4.7 is vendored in `vendor/` (MIT licence included), so no CDN or internet connection is needed. The chart legend is redrawn when the theme changes
- labelled form fields, native validation (`required`, `min`), a per-item Delete button label and a `role="status"` total

### 12. Flashcards
Typed in by hand in VS Code while following step-by-step guidance from an AI assistant; I fixed my own typos and bugs along the way:

- add question/answer cards, flip a card to see the answer, mark it "Knew it" or "Didn't know" and move to the next card (the list loops around with `%`)
- cards saved in `localStorage`; loaded data is checked with `isValidCard` and `filter` inside `try/catch`
- labelled inputs, buttons disabled when there are no cards, `aria-live` counter, reduced-motion respected

### 13. Show search
Typed in by hand in VS Code while following step-by-step guidance from an AI assistant:

- search TV shows by title with the free [TVMaze](https://www.tvmaze.com/api) search API (no key); each result shows a poster, year, rating and a shortened summary
- `async`/`await` with `fetch`, a `response.ok` check, and separate loading, empty and error messages in a `role="status"` region
- the search text goes into the URL with `encodeURIComponent`; results are built with `createElement` and `textContent` (not `innerHTML`), and the HTML in each API summary is turned into plain text with `DOMParser`
- data and posters come from TVMaze, so the page needs an internet connection

## Project READMEs

Each of the twelve main projects has a short README in `docs/projects/` (screenshot, what it does, how it's built, how to run it, what I understood, what was tricky, accessibility notes and tests). The pages themselves stay flat files in the repository root, so the live URLs do not change.

| Project | README | Authorship |
| --- | --- | --- |
| Helpdesk tickets | [helpdesk.md](docs/projects/helpdesk.md) | Built with AI |
| Password checker & generator | [password-checker.md](docs/projects/password-checker.md) | Built with AI |
| Pomodoro timer | [pomodoro.md](docs/projects/pomodoro.md) | Built with AI (11 tests) |
| Weather app | [weather.md](docs/projects/weather.md) | Built with AI |
| GitHub repository explorer | [github-explorer.md](docs/projects/github-explorer.md) | Built with AI |
| IT & security quiz | [quiz.md](docs/projects/quiz.md) | Built with AI |
| JavaScript to-do list | [todo.md](docs/projects/todo.md) | Built with AI |
| Memory match | [memory-game.md](docs/projects/memory-game.md) | Built with AI |
| Word guess game | [word-guess.md](docs/projects/word-guess.md) | Built with AI (11 tests) |
| Expense tracker | [expense-tracker.md](docs/projects/expense-tracker.md) | AI-generated, typed by hand |
| Flashcards | [flashcards.md](docs/projects/flashcards.md) | AI-generated, typed by hand |
| Show search | [show-search.md](docs/projects/show-search.md) | AI-generated, typed by hand |

## Project structure

- `index.html`, `style.css` — portfolio page
- `theme.js`, `theme.css` — shared dark/light theme
- `certificate-viewer.html/.js` — certificate viewer
- `todo.html/.css/.js`, `github.html/.css/.js`, `memory-game.html/.css/.js`, `weather.html/.css/.js`, `helpdesk.html/.css/.js`, `quiz.html/.css/.js`, `password.html/.css/.js`, `wordle.html/.css/.js`, `pomodoro.html/.css/.js`, `expenses.html/.css/.js`, `flashcards.html/.css/.js`, `shows.html/.css/.js` — the apps
- `tests/` — Node tests for pure game logic (`node --test "tests/*.test.js"`)
- `docs/projects/` — one short README per main project (screenshot, how it works, how to run it)
- `*.webp`, `social-preview.png`, `favicon.*` — images (`social-preview.png` is the 1200×630 share image used by `og:image` / `twitter:image`)
- `certificates/` — certificate images (WebP for the page, PNG/JPEG/PDF originals)
- `vendor/` — Chart.js 4.4.7 (MIT) used by the expense tracker, with its licence
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

## Tests

The tests use Node's built-in test runner (`node:test`), so there is nothing to install. They need Node 18 or newer (CI uses Node 22). Run them from the repository root, the same command CI uses:

```
node --test "tests/*.test.js"
```

There are 22 tests, all for pure logic that is exported with `module.exports` from the page scripts:

- `tests/pomodoro.test.js` (11): time formatting, remaining time from timestamps (including a long background pause), the next mode after each round, progress, the page title text, settings and stats validation, and adding a focus round
- `tests/wordle.test.js` (11): scoring a guess (including repeated letters), keeping the best keyboard state, the word lists, the word of the day, stats validation and updates, and the share text

The other projects have no automated tests; they are checked by hand, with axe and with Lighthouse.

## Deployment

Published with GitHub Pages as static files.

## Skills practiced

- semantic HTML, accessibility and responsive CSS
- DOM manipulation, state and timers in vanilla JavaScript
- browser storage with `localStorage`
- consuming public REST APIs (GitHub, Open-Meteo) with async/await and error handling
- theming with CSS variables and `prefers-color-scheme`
