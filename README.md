# Wilhelm Johansson | Portfolio

This repository contains a small static portfolio website built with HTML, CSS, and JavaScript. It showcases a profile page alongside two interactive browser apps: a to-do list and a GitHub profile finder.

## Live site

- [Profile page](https://wjohansson94.github.io/my-profile/)
- [To-do list demo](https://wjohansson94.github.io/my-profile/todo.html)
- [GitHub profile finder demo](https://wjohansson94.github.io/my-profile/github.html)

## Overview

### 1. Interactive profile page
A responsive portfolio page presenting Wilhelm Johansson, his skills, and selected projects. The page includes:

- a profile image and introduction
- accessible navigation and skip link
- a greeting button with a dynamic status message
- project cards with live/demo links
- social links and contact call-to-action

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

## Project structure

- `index.html` — portfolio landing page
- `style.css` — profile page styling
- `script.js` — interactive greeting logic
- `todo.html` — to-do list page
- `todo.css` — to-do list styling
- `todo.js` — task logic and persistence
- `github.html` — GitHub finder page
- `github.css` — GitHub finder styling
- `github.js` — GitHub API requests and rendering
- `profile.jpg` — profile image
- `favicon.png` — browser favicon
- `Profile page.png` — profile page preview
- `To-do list.png` — to-do app preview
- `github-finder.png` — GitHub finder preview

## Getting started

Because this is a static site, there is no build step or package installation required.

1. Clone or download the repository.
2. Open `index.html` in your browser to view the profile page.
3. Open `todo.html` and `github.html` to use the other projects.

## Deployment

The site is published through GitHub Pages and uses direct static file hosting.

## Skills practiced

- semantic HTML and accessible UI patterns
- responsive CSS layouts
- DOM manipulation with JavaScript
- browser storage with `localStorage`
- consuming a public REST API
- handling asynchronous loading and error states
