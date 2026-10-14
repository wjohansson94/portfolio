(function () {
  var STORAGE_KEY = "theme";
  var root = document.documentElement;
  var query = window.matchMedia("(prefers-color-scheme: light)");

  function getStoredTheme() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      /* Storage can be blocked; the theme still applies for this visit. */
    }
  }

  function getSystemTheme() {
    return query.matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#eef3f8" : "#090f18");
    }
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      var next = theme === "light" ? "dark" : "light";
      button.setAttribute("aria-label", "Switch to " + next + " theme");
      var label = button.querySelector("[data-theme-label]");
      if (label) {
        label.textContent = theme === "light" ? "Dark" : "Light";
      }
      var icon = button.querySelector("[data-theme-icon]");
      if (icon) {
        icon.textContent = theme === "light" ? "☾" : "☀";
      }
    });
  }

  applyTheme(getStoredTheme() || getSystemTheme());

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.querySelector("[data-theme-toggle]")) {
      var floating = document.createElement("button");
      floating.type = "button";
      floating.className = "theme-toggle theme-toggle-floating";
      floating.setAttribute("data-theme-toggle", "");
      floating.innerHTML =
        '<span aria-hidden="true" data-theme-icon></span><span data-theme-label></span>';
      document.body.appendChild(floating);
    }

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
        storeTheme(next);
        applyTheme(next);
      });
    });

    applyTheme(root.getAttribute("data-theme"));
  });

  function onSystemChange() {
    if (!getStoredTheme()) {
      applyTheme(getSystemTheme());
    }
  }

  if (query.addEventListener) {
    query.addEventListener("change", onSystemChange);
  } else if (query.addListener) {
    query.addListener(onSystemChange);
  }
})();
