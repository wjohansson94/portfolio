const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HISTORY_KEY = "weatherHistory";
const UNIT_KEY = "weatherUnit";
const HISTORY_LIMIT = 5;
const REQUEST_TIMEOUT_MS = 15000;

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city");
const locateButton = document.querySelector("#locate-button");
const unitButtons = document.querySelectorAll("[data-unit]");
const statusMessage = document.querySelector("#status");
const errorMessage = document.querySelector("#error");
const results = document.querySelector("#results");
const placeName = document.querySelector("#place-name");
const currentIcon = document.querySelector("#current-icon");
const currentTemp = document.querySelector("#current-temp");
const currentSummary = document.querySelector("#current-summary");
const currentFeels = document.querySelector("#current-feels");
const currentHumidity = document.querySelector("#current-humidity");
const currentWind = document.querySelector("#current-wind");
const forecastList = document.querySelector("#forecast");
const historySection = document.querySelector("#history");
const historyList = document.querySelector("#history-list");
const clearHistoryButton = document.querySelector("#clear-history");
const matchesSection = document.querySelector("#matches");
const matchesList = document.querySelector("#matches-list");

// WMO weather interpretation codes used by Open-Meteo.
const weatherCodes = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Freezing fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  56: ["Light freezing drizzle", "🌧️"],
  57: ["Freezing drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Light freezing rain", "🌧️"],
  67: ["Freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "❄️"],
  80: ["Light rain showers", "🌦️"],
  81: ["Rain showers", "🌧️"],
  82: ["Heavy rain showers", "⛈️"],
  85: ["Light snow showers", "🌨️"],
  86: ["Snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️"],
};

let unit = loadUnit();
let weatherData = null;
let currentPlace = null;
let activeController = null;

function loadUnit() {
  try {
    return localStorage.getItem(UNIT_KEY) === "f" ? "f" : "c";
  } catch (error) {
    return "c";
  }
}

function saveUnit() {
  try {
    localStorage.setItem(UNIT_KEY, unit);
  } catch (error) {
    // The unit still works for this visit if storage is blocked.
  }
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved)
      ? saved.filter(function (place) {
          return (
            place &&
            typeof place.label === "string" &&
            Number.isFinite(place.latitude) &&
            Number.isFinite(place.longitude)
          );
        })
      : [];
  } catch (error) {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    return false;
  }
}

function addToHistory(place) {
  const history = loadHistory().filter(function (item) {
    return item.label !== place.label;
  });
  history.unshift({
    label: place.label,
    latitude: place.latitude,
    longitude: place.longitude,
  });
  saveHistory(history.slice(0, HISTORY_LIMIT));
  renderHistory();
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  setStatus("");
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function setLoading(isLoading) {
  results.setAttribute("aria-busy", String(isLoading));
  searchForm.querySelector('[type="submit"]').disabled = isLoading;
  locateButton.disabled = isLoading;
  if (isLoading) {
    results.classList.add("is-loading");
  } else {
    results.classList.remove("is-loading");
  }
}

function celsiusToDisplay(value) {
  const converted = unit === "f" ? (value * 9) / 5 + 32 : value;
  return `${Math.round(converted)}°${unit.toUpperCase()}`;
}

function windToDisplay(valueKmh) {
  return unit === "f"
    ? `${Math.round(valueKmh * 0.621371)} mph`
    : `${Math.round(valueKmh)} km/h`;
}

function describe(code) {
  return weatherCodes[code] || ["Unknown conditions", "🌡️"];
}

function formatDay(dateString, index) {
  if (index === 0) {
    return "Today";
  }

  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function buildPlaceLabel(place) {
  return [place.name, place.admin1, place.country]
    .filter(function (part, index, parts) {
      return part && parts.indexOf(part) === index;
    })
    .join(", ");
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error("The weather service could not complete that request.");
  }
  return response.json();
}

function withTimeout(controller) {
  return window.setTimeout(function () {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
}

function getErrorMessage(error) {
  if (error.name === "AbortError") {
    return "The weather service took too long to respond. Please try again.";
  }
  if (error instanceof TypeError) {
    return "Could not connect to the weather service. Check your connection and try again.";
  }
  return error.message || "Something went wrong. Please try again.";
}

function renderWeather() {
  if (!weatherData || !currentPlace) {
    return;
  }

  const current = weatherData.current;
  const daily = weatherData.daily;
  const [summary, icon] = describe(current.weather_code);

  placeName.textContent = currentPlace.label;
  currentIcon.textContent = icon;
  currentTemp.textContent = celsiusToDisplay(current.temperature_2m);
  currentSummary.textContent = summary;
  currentFeels.textContent = celsiusToDisplay(current.apparent_temperature);
  currentHumidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  currentWind.textContent = windToDisplay(current.wind_speed_10m);

  forecastList.replaceChildren(
    ...daily.time.map(function (date, index) {
      const [dayDescription, dayIcon] = describe(daily.weather_code[index]);
      const item = document.createElement("li");
      item.className = "forecast-day";

      const name = document.createElement("span");
      name.className = "forecast-name";
      name.textContent = formatDay(date, index);

      const iconElement = document.createElement("span");
      iconElement.className = "weather-icon";
      iconElement.setAttribute("aria-hidden", "true");
      iconElement.textContent = dayIcon;

      const text = document.createElement("span");
      text.className = "forecast-text";
      text.textContent = dayDescription;

      const range = document.createElement("span");
      range.className = "forecast-range";
      range.textContent = `${celsiusToDisplay(
        daily.temperature_2m_max[index],
      )} / ${celsiusToDisplay(daily.temperature_2m_min[index])}`;
      range.setAttribute(
        "aria-label",
        `High ${celsiusToDisplay(
          daily.temperature_2m_max[index],
        )}, low ${celsiusToDisplay(daily.temperature_2m_min[index])}`,
      );

      const rain = document.createElement("span");
      rain.className = "forecast-rain";
      const chance = daily.precipitation_probability_max[index];
      rain.textContent = Number.isFinite(chance) ? `💧 ${chance}%` : "";
      if (Number.isFinite(chance)) {
        rain.setAttribute("aria-label", `${chance}% chance of precipitation`);
      }

      item.append(name, iconElement, text, range, rain);
      return item;
    }),
  );

  results.hidden = false;
}

function announceWeather() {
  const current = weatherData.current;
  const [summary] = describe(current.weather_code);
  setStatus(
    `Showing weather for ${currentPlace.label}: ${celsiusToDisplay(
      current.temperature_2m,
    )}, ${summary.toLowerCase()}.`,
  );
}

async function loadWeather(place) {
  if (activeController) {
    activeController.abort();
  }

  const controller = new AbortController();
  activeController = controller;
  const timeoutId = withTimeout(controller);

  clearError();
  setLoading(true);
  setStatus(`Loading weather for ${place.label}…`);

  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
  });

  try {
    const data = await fetchJson(`${FORECAST_URL}?${params}`, controller.signal);
    if (activeController !== controller) {
      return;
    }

    weatherData = data;
    currentPlace = place;
    renderWeather();
    announceWeather();
    addToHistory(place);
  } catch (error) {
    if (activeController !== controller) {
      return;
    }
    showError(getErrorMessage(error));
  } finally {
    window.clearTimeout(timeoutId);
    if (activeController === controller) {
      activeController = null;
      setLoading(false);
    }
  }
}

function renderPlaceButtons(list, places, onSelect) {
  list.replaceChildren(
    ...places.map(function (place) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip-button";
      button.textContent = place.label;
      button.addEventListener("click", function () {
        onSelect(place);
      });
      item.append(button);
      return item;
    }),
  );
}

function renderHistory() {
  const history = loadHistory();
  historySection.hidden = history.length === 0;
  renderPlaceButtons(historyList, history, function (place) {
    matchesSection.hidden = true;
    loadWeather(place);
  });
}

function renderMatches(places) {
  matchesSection.hidden = places.length === 0;
  renderPlaceButtons(matchesList, places, function (place) {
    matchesSection.hidden = true;
    loadWeather(place);
  });
}

async function searchCity(query) {
  if (activeController) {
    activeController.abort();
  }

  const controller = new AbortController();
  activeController = controller;
  const timeoutId = withTimeout(controller);

  clearError();
  matchesSection.hidden = true;
  setLoading(true);
  setStatus(`Searching for ${query}…`);

  const params = new URLSearchParams({
    name: query,
    count: "5",
    language: "en",
    format: "json",
  });

  try {
    const data = await fetchJson(`${GEOCODING_URL}?${params}`, controller.signal);
    if (activeController !== controller) {
      return;
    }

    const places = (data.results || []).map(function (place) {
      return {
        label: buildPlaceLabel(place),
        latitude: place.latitude,
        longitude: place.longitude,
      };
    });

    if (places.length === 0) {
      results.hidden = true;
      showError(`No city found for “${query}”. Check the spelling or try another city.`);
      return;
    }

    activeController = null;
    window.clearTimeout(timeoutId);
    renderMatches(places.slice(1));
    await loadWeather(places[0]);
  } catch (error) {
    if (activeController !== controller) {
      return;
    }
    results.hidden = true;
    showError(getErrorMessage(error));
  } finally {
    window.clearTimeout(timeoutId);
    if (activeController === controller) {
      activeController = null;
      setLoading(false);
    }
  }
}

function useMyLocation() {
  if (!("geolocation" in navigator)) {
    showError("Your browser does not support location. Search for a city instead.");
    return;
  }

  clearError();
  setStatus("Waiting for your location…");
  locateButton.disabled = true;

  navigator.geolocation.getCurrentPosition(
    function (position) {
      locateButton.disabled = false;
      matchesSection.hidden = true;
      const latitude = Number(position.coords.latitude.toFixed(3));
      const longitude = Number(position.coords.longitude.toFixed(3));
      loadWeather({
        label: `My location (${latitude}, ${longitude})`,
        latitude,
        longitude,
      });
    },
    function (error) {
      locateButton.disabled = false;
      showError(
        error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. You can still search for a city."
          : "Your location could not be determined. Try searching for a city instead.",
      );
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
  );
}

function updateUnitButtons() {
  unitButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", String(button.dataset.unit === unit));
  });
}

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const query = cityInput.value.trim();
  if (!query) {
    cityInput.focus();
    return;
  }
  searchCity(query);
});

locateButton.addEventListener("click", useMyLocation);

unitButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    if (unit === button.dataset.unit) {
      return;
    }
    unit = button.dataset.unit;
    saveUnit();
    updateUnitButtons();
    if (weatherData) {
      renderWeather();
      announceWeather();
    }
  });
});

clearHistoryButton.addEventListener("click", function () {
  saveHistory([]);
  renderHistory();
  setStatus("Search history cleared.");
  cityInput.focus();
});

updateUnitButtons();
renderHistory();
