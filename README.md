# Wilhelm Johansson | Profile

This repository contains a small static portfolio website built with HTML, CSS, and JavaScript. It showcases a profile page alongside three interactive browser apps: a to-do list, a GitHub profile finder, and a memory match game.

## Live site

- [Profile page](https://wjohansson94.github.io/portfolio/)
- [To-do list demo](https://wjohansson94.github.io/portfolio/todo.html)
- [GitHub profile finder demo](https://wjohansson94.github.io/portfolio/github.html)
- [Memory match game](https://wjohansson94.github.io/portfolio/memory-game.html)

## Overview

### 1. Personal portfolio page
A responsive portfolio page presenting Wilhelm Johansson, his skills, and selected projects. The page includes:

- a profile image and introduction
- accessible navigation and skip link
- About and skills panels
- a “Currently learning” section linking to an in-progress Coursera professional certificate
- a responsive “My learning journey” gallery with certificate image previews and links to the original PDFs
- a dark-themed certificate viewer with a link back to the gallery
- a two-column project grid on desktop that stacks on smaller screens
- project cards describing each project’s purpose, what was built, and what was learned
- interactive project demos and source links
- GitHub, LinkedIn, Instagram, and Threads social links with matching inline icons
- a pill-shaped contact button with hover and keyboard-focus feedback
- transparent attribution of GitHub Copilot as an AI coding assistant, alongside a commitment to hands-on learning, ongoing courses, and relevant certifications
- a coordinated dark theme with teal and violet accents shared by the project demos
- pill-shaped buttons, inputs, and skill tags, with softly rounded project cards

### 2. JavaScript to-do list
A task manager that lets the user:

- add tasks
- mark tasks as complete or active
- edit existing tasks
- delete tasks
- filter tasks by All, Active, and Completed
- persist tasks in `localStorage`

### 3. GitHub profile finder
A simple client-side GitHub lookup app that:

- searches for a public GitHub username
- displays profile details such as avatar, bio, location, and stats
- lists recently updated repositories
- handles loading, empty, timeout, network, not-found, and rate-limit states

### 4. Memory match
A browser-based matching game that lets the player:

- find eight pairs of themed cards
- track moves and elapsed time
- restart with a freshly shuffled board

## Project structure

- `index.html` — portfolio landing page
- `certificate-viewer.html` — dark-themed certificate image viewer
- `certificate-viewer.js` — certificate viewer content and selection
- `style.css` — profile page styling
- `todo.html` — to-do list page
- `todo.css` — to-do list styling
- `todo.js` — task logic and persistence
- `github.html` — GitHub finder page
- `github.css` — GitHub finder styling
- `github.js` — GitHub API requests and rendering
- `memory-game.html` — memory match game page
- `memory-game.css` — memory game styling
- `memory-game.js` — game logic, matching, move count, and timer
- `memory-game.png` — memory game project screenshot
- `profile.jpg` — profile image
- `favicon.png` — browser favicon
- `certificates/` — certificate files displayed in the portfolio:
  - `ibm-software-engineering.png` and `michigan-python-basics.png` — cropped display images used by the portfolio and viewer
  - `ibm-software-engineering.jpeg` and `michigan-python-basics.jpeg` — original certificate images
  - `agentic-ai-cert.png`
  - `microsoft-cert.png`
  - `agentic-ai-cert.pdf`
  - `microsoft-cert.pdf`
- `Profile page.png` — profile page preview
- `To-do list.png` — to-do app preview
- `github-finder.png` — GitHub finder preview

## Getting started

Because this is a static site, there is no build step or package installation required.

1. Clone or download the repository.
2. Open `index.html` in your browser to view the profile page.
3. Open `todo.html`, `github.html`, and `memory-game.html` to use the project demos.

## Deployment

The site is published through GitHub Pages and uses direct static file hosting.

## Skills practiced

- semantic HTML and accessible UI patterns
- accessibility and responsive design
- responsive CSS layouts
- DOM manipulation with JavaScript
- managing game state and timed interactions
- browser storage with `localStorage`
- consuming a public REST API
- handling asynchronous loading and error states
