const searchForm = document.querySelector("#search-form");
const usernameInput = document.querySelector("#username");
const statusMessage = document.querySelector("#status");
const emptyState = document.querySelector("#empty-state");
const emptyMessage = document.querySelector("#empty-message");
const results = document.querySelector("#results");
const profileAvatar = document.querySelector("#avatar");
const profileName = document.querySelector("#profile-name");
const profileLogin = document.querySelector("#profile-login");
const profileBio = document.querySelector("#bio");
const profileLocation = document.querySelector("#location");
const viewProfileLink = document.querySelector("#view-profile");
const publicRepos = document.querySelector("#public-repos");
const followers = document.querySelector("#followers");
const following = document.querySelector("#following");
const repoStatus = document.querySelector("#repo-status");
const repoSearch = document.querySelector("#repo-search");
const languageFilter = document.querySelector("#language-filter");
const repoSort = document.querySelector("#repo-sort");
const favoritesOnlyFilter = document.querySelector("#favorites-only");
const repoEmptyState = document.querySelector("#repo-empty-state");
const repoList = document.querySelector("#repo-list");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageStatus = document.querySelector("#page-status");
const loadMoreButton = document.querySelector("#load-more");

const REPOSITORIES_PER_PAGE = 30;
const VISIBLE_REPOSITORIES_PER_PAGE = 10;
let activeController;
let currentUsername = "";
let repositories = [];
let favoriteRepositories = new Set();
let currentPage = 1;
let hasMoreRepositories = false;
let repositoryTotal = 0;
let favoritesLoadError = false;
let repositoryLoadError = "";

function setStatus(message, state) {
  statusMessage.textContent = message;

  if (state) {
    statusMessage.dataset.state = state;
  } else {
    delete statusMessage.dataset.state;
  }
}

function getRequestError(response) {
  if (response.status === 404) {
    return new Error("No public GitHub account was found for that username.");
  }

  if (response.status === 403 || response.status === 429) {
    return new Error(
      "GitHub's API rate limit was reached. Please try again later.",
    );
  }

  return new Error("GitHub could not load that data. Please try again.");
}

async function fetchJson(url, signal) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    signal,
  });

  if (!response.ok) {
    throw getRequestError(response);
  }

  return response.json();
}

function formatCount(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function getFavoritesStorageKey(username) {
  return `githubRepoFavorites:${username.toLowerCase()}`;
}

function loadFavorites(username) {
  favoritesLoadError = false;

  try {
    const savedFavorites = localStorage.getItem(
      getFavoritesStorageKey(username),
    );
    const favoriteNames = savedFavorites ? JSON.parse(savedFavorites) : [];

    if (!Array.isArray(favoriteNames)) {
      throw new Error("Saved favorites are not in the expected format.");
    }

    favoriteRepositories = new Set(favoriteNames);
  } catch (error) {
    favoriteRepositories = new Set();
    favoritesLoadError = true;
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(
      getFavoritesStorageKey(currentUsername),
      JSON.stringify([...favoriteRepositories]),
    );
    return true;
  } catch (error) {
    setStatus("Favorites could not be saved in this browser.", "error");
    return false;
  }
}

function renderProfile(profile) {
  profileAvatar.src = profile.avatar_url;
  profileAvatar.alt = `GitHub avatar for ${profile.login}`;
  profileName.textContent = profile.name || profile.login;
  profileLogin.textContent = `@${profile.login}`;
  profileLogin.href = profile.html_url;
  profileBio.textContent = profile.bio || "No bio provided.";
  profileLocation.hidden = !profile.location;
  profileLocation.textContent = profile.location
    ? `Based in ${profile.location}`
    : "";
  viewProfileLink.href = profile.html_url;
  publicRepos.textContent = formatCount(profile.public_repos);
  followers.textContent = formatCount(profile.followers);
  following.textContent = formatCount(profile.following);
}

function createRepositoryItem(repository) {
  const item = document.createElement("li");
  const details = document.createElement("div");
  const heading = document.createElement("h3");
  const link = document.createElement("a");
  const description = document.createElement("p");
  const metadata = document.createElement("p");
  const actions = document.createElement("div");
  const favoriteButton = document.createElement("button");

  details.className = "repo-details";
  link.href = repository.html_url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = repository.name;
  description.textContent =
    repository.description || "No description provided.";
  metadata.className = "repo-metadata";

  if (repository.language) {
    const language = document.createElement("span");
    language.textContent = repository.language;
    metadata.append(language);
  }

  const stars = document.createElement("span");
  stars.textContent = `${formatCount(repository.stargazers_count)} stars`;
  metadata.append(stars);

  const updated = document.createElement("span");
  updated.textContent = `Updated ${new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(repository.updated_at))}`;
  metadata.append(updated);

  const isFavorite = favoriteRepositories.has(repository.full_name);
  actions.className = "repo-actions";
  favoriteButton.type = "button";
  favoriteButton.className = "favorite-button";
  favoriteButton.dataset.favoriteId = repository.full_name;
  favoriteButton.setAttribute("aria-pressed", String(isFavorite));
  favoriteButton.setAttribute(
    "aria-label",
    `${isFavorite ? "Remove" : "Save"} ${repository.name} ${
      isFavorite ? "from" : "to"
    } favorites`,
  );
  favoriteButton.textContent = isFavorite ? "★ Saved" : "☆ Save";
  favoriteButton.addEventListener("click", function () {
    const wasFavorite = favoriteRepositories.has(repository.full_name);
    if (wasFavorite) {
      favoriteRepositories.delete(repository.full_name);
    } else {
      favoriteRepositories.add(repository.full_name);
    }

    if (!saveFavorites()) {
      if (wasFavorite) {
        favoriteRepositories.add(repository.full_name);
      } else {
        favoriteRepositories.delete(repository.full_name);
      }
      return;
    }

    if (
      favoritesOnlyFilter.checked &&
      !favoriteRepositories.has(repository.full_name)
    ) {
      renderRepositories();
      favoritesOnlyFilter.focus();
      setStatus(`Removed ${repository.name} from favorites.`, "success");
      return;
    }

    renderRepositories();
    const updatedFavoriteButton = Array.from(
      repoList.querySelectorAll(".favorite-button"),
    ).find(function (button) {
      return button.dataset.favoriteId === repository.full_name;
    });
    updatedFavoriteButton?.focus();
    setStatus(
      `${repository.name} ${
        favoriteRepositories.has(repository.full_name)
          ? "added to"
          : "removed from"
      } favorites.`,
      "success",
    );
  });

  heading.append(link);
  details.append(heading, description, metadata);
  actions.append(favoriteButton);
  item.append(details, actions);

  return item;
}

function getFilteredRepositories() {
  const searchTerm = repoSearch.value.trim().toLowerCase();
  const selectedLanguage = languageFilter.value;

  return repositories
    .map(function (repository, index) {
      return { repository, index };
    })
    .filter(function ({ repository }) {
      const searchableText =
        `${repository.name} ${repository.full_name} ${
          repository.description || ""
        }`.toLowerCase();
      const matchesSearch = searchableText.includes(searchTerm);
      const matchesLanguage =
        !selectedLanguage || repository.language === selectedLanguage;
      const matchesFavorites =
        !favoritesOnlyFilter.checked ||
        favoriteRepositories.has(repository.full_name);

      return matchesSearch && matchesLanguage && matchesFavorites;
    })
    .sort(function (left, right) {
      if (repoSort.value === "name") {
        return (
          left.repository.name.localeCompare(right.repository.name) ||
          left.index - right.index
        );
      }

      if (repoSort.value === "stars") {
        return (
          right.repository.stargazers_count -
            left.repository.stargazers_count ||
          left.repository.name.localeCompare(right.repository.name)
        );
      }

      return (
        right.repository.updated_at.localeCompare(
          left.repository.updated_at,
        ) || left.index - right.index
      );
    });
}

function updateLanguageOptions() {
  const selectedLanguage = languageFilter.value;
  const languages = [
    ...new Set(
      repositories
        .map(function (repository) {
          return repository.language;
        })
        .filter(Boolean),
    ),
  ].sort(function (left, right) {
    return left.localeCompare(right);
  });

  languageFilter.replaceChildren(new Option("All languages", ""));
  languages.forEach(function (language) {
    languageFilter.append(new Option(language, language));
  });

  if (languages.includes(selectedLanguage)) {
    languageFilter.value = selectedLanguage;
  }
}

function renderRepositories() {
  updateLanguageOptions();
  const filteredRepositories = getFilteredRepositories();
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRepositories.length / VISIBLE_REPOSITORIES_PER_PAGE),
  );
  currentPage = Math.min(currentPage, totalPages);
  const startIndex = (currentPage - 1) * VISIBLE_REPOSITORIES_PER_PAGE;
  const currentRepositories = filteredRepositories.slice(
    startIndex,
    startIndex + VISIBLE_REPOSITORIES_PER_PAGE,
  );

  repoList.replaceChildren(
    ...currentRepositories.map(function ({ repository }) {
      return createRepositoryItem(repository);
    }),
  );

  const firstShown = filteredRepositories.length === 0 ? 0 : startIndex + 1;
  const lastShown = Math.min(
    startIndex + VISIBLE_REPOSITORIES_PER_PAGE,
    filteredRepositories.length,
  );
  repoStatus.textContent = repositories.length
    ? `Showing ${formatCount(firstShown)}–${formatCount(lastShown)} of ${formatCount(
        filteredRepositories.length,
      )} matching · ${formatCount(repositories.length)} loaded`
    : repositoryLoadError || `${formatCount(repositories.length)} loaded`;

  pageStatus.textContent = `Page ${currentPage} of ${totalPages}`;
  previousPageButton.disabled = currentPage <= 1;
  nextPageButton.disabled = currentPage >= totalPages;

  repoEmptyState.hidden = currentRepositories.length > 0;
  if (repositories.length === 0) {
    repoEmptyState.textContent = "No public repositories have been loaded.";
  } else if (
    filteredRepositories.length === 0 &&
    favoritesOnlyFilter.checked
  ) {
    repoEmptyState.textContent =
      "No loaded repositories are saved as favorites. Load more repositories or change the filters.";
  } else if (filteredRepositories.length === 0) {
    repoEmptyState.textContent =
      "No loaded repositories match these filters. Load more repositories or change the filters.";
  } else {
    repoEmptyState.textContent = "";
  }

  loadMoreButton.hidden = !hasMoreRepositories;
}

function resetRepositoryExplorer(username) {
  currentUsername = username;
  repositories = [];
  currentPage = 1;
  hasMoreRepositories = false;
  repositoryTotal = 0;
  repositoryLoadError = "";
  repoSearch.value = "";
  languageFilter.value = "";
  repoSort.value = "updated";
  favoritesOnlyFilter.checked = false;
  loadFavorites(username);
  repoList.replaceChildren();
  repoStatus.textContent = "Loading repositories...";
  pageStatus.textContent = "";
  repoEmptyState.hidden = true;
  loadMoreButton.hidden = true;
  previousPageButton.disabled = true;
  nextPageButton.disabled = true;
}

async function fetchRepositoryPage(username, page, signal) {
  const encodedUsername = encodeURIComponent(username);
  return fetchJson(
    `https://api.github.com/users/${encodedUsername}/repos?sort=updated&per_page=${REPOSITORIES_PER_PAGE}&page=${page}&type=owner`,
    signal,
  );
}

function setRepositoryError(error, fallbackMessage) {
  repositoryLoadError =
    error.name === "AbortError"
      ? "Loading repositories took too long."
      : error instanceof TypeError
        ? "Could not connect to GitHub while loading repositories."
        : error.message || fallbackMessage;
  repoStatus.textContent = repositoryLoadError;
}

searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  if (!username) {
    usernameInput.focus();
    return;
  }

  if (activeController) {
    activeController.abort();
  }

  const controller = new AbortController();
  activeController = controller;
  const timeoutId = window.setTimeout(function () {
    controller.abort();
  }, 15000);

  emptyState.hidden = true;
  results.hidden = true;
  resetRepositoryExplorer(username);
  setStatus("Searching GitHub...");

  try {
    const encodedUsername = encodeURIComponent(username);
    const profile = await fetchJson(
      `https://api.github.com/users/${encodedUsername}`,
      controller.signal,
    );

    if (activeController !== controller) {
      return;
    }

    currentUsername = profile.login;
    repositoryTotal = profile.public_repos;
    if (currentUsername.toLowerCase() !== username.toLowerCase()) {
      loadFavorites(currentUsername);
    }
    renderProfile(profile);
    results.hidden = false;

    try {
      const firstPage = await fetchRepositoryPage(
        profile.login,
        1,
        controller.signal,
      );

      if (activeController !== controller) {
        return;
      }

      repositories = firstPage;
      hasMoreRepositories = repositories.length < repositoryTotal;
      renderRepositories();
      setStatus(
        favoritesLoadError
          ? `Loaded @${profile.login}, but saved favorites could not be read.`
          : `Loaded @${profile.login}.`,
        favoritesLoadError ? "error" : "success",
      );
    } catch (error) {
      if (activeController !== controller) {
        return;
      }

      setRepositoryError(error, "Repositories could not be loaded.");
      renderRepositories();
      setStatus(
        `Loaded @${profile.login}, but repositories were unavailable.`,
        "error",
      );
    }
  } catch (error) {
    if (activeController !== controller) {
      return;
    }

    emptyState.hidden = false;
    emptyMessage.textContent =
      error.name === "AbortError"
        ? "GitHub took too long to respond. Please try again."
        : error instanceof TypeError
          ? "Could not connect to GitHub. Check your connection and try again."
          : error.message;
    setStatus("Search failed.", "error");
  } finally {
    window.clearTimeout(timeoutId);
    if (activeController === controller) {
      activeController = undefined;
    }
  }
});

function rerenderFromFirstPage() {
  currentPage = 1;
  renderRepositories();
}

repoSearch.addEventListener("input", rerenderFromFirstPage);
languageFilter.addEventListener("change", rerenderFromFirstPage);
repoSort.addEventListener("change", rerenderFromFirstPage);
favoritesOnlyFilter.addEventListener("change", rerenderFromFirstPage);

previousPageButton.addEventListener("click", function () {
  currentPage -= 1;
  renderRepositories();
});

nextPageButton.addEventListener("click", function () {
  currentPage += 1;
  renderRepositories();
});

loadMoreButton.addEventListener("click", async function () {
  if (!currentUsername || !hasMoreRepositories) {
    return;
  }

  if (activeController) {
    activeController.abort();
  }

  const controller = new AbortController();
  activeController = controller;
  const timeoutId = window.setTimeout(function () {
    controller.abort();
  }, 15000);
  const nextApiPage = Math.floor(
    repositories.length / REPOSITORIES_PER_PAGE,
  ) + 1;

  loadMoreButton.disabled = true;
  loadMoreButton.textContent = "Loading…";
  repoStatus.textContent = "Loading more repositories...";

  try {
    const nextRepositories = await fetchRepositoryPage(
      currentUsername,
      nextApiPage,
      controller.signal,
    );

    if (activeController !== controller) {
      return;
    }

    repositories = repositories.concat(nextRepositories);
    hasMoreRepositories = repositories.length < repositoryTotal;
    repositoryLoadError = "";
    renderRepositories();
    setStatus(
      `Loaded ${formatCount(repositories.length)} repositories for @${currentUsername}.`,
      "success",
    );
  } catch (error) {
    if (activeController !== controller) {
      return;
    }

    setRepositoryError(error, "More repositories could not be loaded.");
    setStatus("Could not load more repositories.", "error");
  } finally {
    window.clearTimeout(timeoutId);
    loadMoreButton.disabled = false;
    loadMoreButton.textContent = "Load more repositories";
    if (activeController === controller) {
      activeController = undefined;
    }
  }
});
