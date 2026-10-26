const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const statusEl = document.querySelector("#status");
const resultsEl = document.querySelector("#results");

const API_URL = "https://api.tvmaze.com/search/shows?q=";

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    return doc.body.textContent || "";
}

function shorten(text, max = 140) {
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function createCard(show) {
    const li = document.createElement("li");
    li.className = "show-card";

    const img = document.createElement("img");
    img.src = show.image ? show.image.medium : "";
    img.alt = show.image ? `Poster for ${show.name}` : "";
    img.width = 90;
    img.height = 126;

    const info = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = show.name;

    const year = show.premiered ? show.premiered.slice(0, 4) : "Unknown year";
    const rating = show.rating && show.rating.average ? `★ ${show.rating.average}` : "No rating";
    const meta = document.createElement("p");
    meta.className = "show-meta";
    meta.textContent = `${year} · ${rating}`;

    const summary = document.createElement("p");
    summary.className = "show-summary";
    summary.textContent = shorten(stripHtml(show.summary)) || "No summary available.";

    info.append(title, meta, summary);
    li.append(img, info);
    return li;
}

function renderResults(shows) {
    resultsEl.replaceChildren(...shows.map(createCard));
}

async function searchShows(query) {
  statusEl.textContent = "Loading…";
  resultsEl.replaceChildren();

  try {
    const response = await fetch(API_URL + encodeURIComponent(query));
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    const data = await response.json();
    const shows = data.map((item) => item.show);

    if (shows.length === 0) {
      statusEl.textContent = `No shows found for "${query}".`;
      return;
    }

    statusEl.textContent = `${shows.length} results for "${query}".`;
    renderResults(shows);
  } catch (error) {
    statusEl.textContent = "Something went wrong. Check your connection and try again.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (!query) return;
  searchShows(query);
});