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
const repoList = document.querySelector("#repo-list");
let activeController;

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

  heading.append(link);
  details.append(heading, description, metadata);
  item.append(details);

  return item;
}

function renderRepositories(repositories) {
  repoList.replaceChildren();

  if (repositories.length === 0) {
    repoStatus.textContent = "No public repositories found.";
    return;
  }

  repositories.forEach(function (repository) {
    repoList.append(createRepositoryItem(repository));
  });

  repoStatus.textContent = `${repositories.length} repositories`;
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
  repoList.replaceChildren();
  repoStatus.textContent = "";
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

    renderProfile(profile);
    results.hidden = false;
    repoStatus.textContent = "Loading repositories...";

    let repositoryError = "";
    try {
      const repositories = await fetchJson(
        `https://api.github.com/users/${encodedUsername}/repos?sort=updated&per_page=6&type=owner`,
        controller.signal,
      );

      if (activeController !== controller) {
        return;
      }

      renderRepositories(repositories);
    } catch (error) {
      if (activeController !== controller) {
        return;
      }

      repositoryError =
        error.name === "AbortError"
          ? "Loading repositories took too long."
          : error.message;
      repoStatus.textContent = repositoryError;
    }

    if (activeController === controller) {
      setStatus(
        repositoryError
          ? `Loaded @${profile.login}, but repositories were unavailable.`
          : `Loaded @${profile.login}.`,
        repositoryError ? "error" : "success",
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
