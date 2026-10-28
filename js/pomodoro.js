"use strict";

const SETTINGS_KEY = "pomodoro.settings";
const STATS_KEY = "pomodoro.stats";
const MODES = ["focus", "short", "long"];
const MODE_LABELS = { focus: "Focus", short: "Short break", long: "Long break" };
const DEFAULT_SETTINGS = { focus: 25, short: 5, long: 15, longEvery: 4, sound: false, notify: false };
const LIMITS = { focus: [1, 120], short: [1, 60], long: [1, 120], longEvery: [2, 8] };

// ---- Pure logic (no DOM, so it can be tested in Node) ----

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isInteger(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function validateSettings(raw) {
  const s = raw && typeof raw === "object" ? raw : {};
  const out = {
    sound: s.sound === true,
    notify: s.notify === true,
  };
  for (const key of Object.keys(LIMITS)) {
    out[key] = clampInt(s[key], LIMITS[key][0], LIMITS[key][1], DEFAULT_SETTINGS[key]);
  }
  return out;
}

function durationMs(mode, settings) {
  return settings[mode] * 60 * 1000;
}

// The timer stores an end timestamp, so the result is right even if ticks are skipped.
function remainingMs(endTime, now) {
  return Math.max(0, endTime - now);
}

function nextMode(mode, completedFocusRounds, longEvery) {
  if (mode !== "focus") return "focus";
  return completedFocusRounds > 0 && completedFocusRounds % longEvery === 0 ? "long" : "short";
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function titleText(ms, mode, running) {
  if (!running) return "Pomodoro timer | Wilhelm Johansson";
  return formatTime(ms) + " \u00b7 " + MODE_LABELS[mode];
}

function progressFraction(remaining, total) {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, remaining / total));
}

function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

function emptyStats(today) {
  return { date: today, rounds: 0, focusMinutes: 0, cycle: 0 };
}

// Stored stats are only trusted if they look right. A new day resets the daily numbers.
function validateStats(raw, today) {
  const ok =
    raw &&
    typeof raw === "object" &&
    typeof raw.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(raw.date) &&
    [raw.rounds, raw.focusMinutes, raw.cycle].every((n) => Number.isInteger(n) && n >= 0 && n <= 100000);
  if (!ok) return emptyStats(today);
  if (raw.date !== today) return { date: today, rounds: 0, focusMinutes: 0, cycle: raw.cycle };
  return { date: raw.date, rounds: raw.rounds, focusMinutes: raw.focusMinutes, cycle: raw.cycle };
}

function addFocusRound(stats, today, minutes) {
  const base = validateStats(stats, today);
  return {
    date: today,
    rounds: base.rounds + 1,
    focusMinutes: base.focusMinutes + minutes,
    cycle: base.cycle + 1,
  };
}

function formatMinutes(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return hours > 0 ? hours + " h " + minutes + " min" : minutes + " min";
}

// ---- Page code ----

function init() {
  const $ = (id) => document.getElementById(id);
  const timeEl = $("time");
  const modeLabel = $("mode-label");
  const statusEl = $("status");
  const ring = $("ring-progress");
  const startBtn = $("start");
  const resetBtn = $("reset");
  const skipBtn = $("skip");
  const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
  const inputs = { focus: $("set-focus"), short: $("set-short"), long: $("set-long"), longEvery: $("set-every") };
  const soundBox = $("set-sound");
  const notifyBox = $("set-notify");
  const settingsNote = $("settings-note");
  const roundsEl = $("stat-rounds");
  const minutesEl = $("stat-minutes");
  const cycleEl = $("stat-cycle");
  const resetStatsBtn = $("reset-stats");
  const circumference = 2 * Math.PI * 90;
  ring.style.strokeDasharray = String(circumference);

  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      return null;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      settingsNote.textContent = "Could not save to this browser, so changes will be lost on reload.";
    }
  }

  let settings = validateSettings(load(SETTINGS_KEY));
  let stats = validateStats(load(STATS_KEY), dateKey(new Date()));
  let mode = "focus";
  let running = false;
  let endTime = 0;
  let remaining = durationMs(mode, settings);
  let timerId = null;
  let audioContext = null;

  function say(message) {
    statusEl.textContent = message;
  }

  function render() {
    const total = durationMs(mode, settings);
    timeEl.textContent = formatTime(remaining);
    modeLabel.textContent = MODE_LABELS[mode];
    ring.style.strokeDashoffset = String(circumference * (1 - progressFraction(remaining, total)));
    document.title = titleText(remaining, mode, running);
    startBtn.textContent = running ? "Pause" : remaining < total ? "Resume" : "Start";
    modeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    });
    document.documentElement.dataset.mode = mode;
  }

  function renderStats() {
    stats = validateStats(stats, dateKey(new Date()));
    roundsEl.textContent = String(stats.rounds);
    minutesEl.textContent = formatMinutes(stats.focusMinutes);
    const inCycle = stats.cycle > 0 && stats.cycle % settings.longEvery === 0 ? settings.longEvery : stats.cycle % settings.longEvery;
    cycleEl.textContent = inCycle + " of " + settings.longEvery;
  }

  function tick() {
    if (!running) return;
    remaining = remainingMs(endTime, Date.now());
    if (remaining === 0) {
      complete();
    } else {
      render();
    }
  }

  function startTicking() {
    clearInterval(timerId);
    timerId = setInterval(tick, 250);
  }

  function stopTicking() {
    clearInterval(timerId);
    timerId = null;
  }

  function start() {
    running = true;
    endTime = Date.now() + remaining;
    startTicking();
    say(MODE_LABELS[mode] + " started.");
    render();
  }

  function pause() {
    remaining = remainingMs(endTime, Date.now());
    running = false;
    stopTicking();
    say("Paused at " + formatTime(remaining) + ".");
    render();
  }

  function setMode(newMode, announce) {
    mode = newMode;
    running = false;
    stopTicking();
    remaining = durationMs(mode, settings);
    if (announce) say("Switched to " + MODE_LABELS[mode] + ", " + formatTime(remaining) + ".");
    render();
  }

  function beep() {
    if (!settings.sound) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = 0.15;
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      // Sound is optional, so a failure is ignored.
    }
  }

  function notify(message) {
    if (!settings.notify || !("Notification" in window) || Notification.permission !== "granted") return;
    try {
      new Notification("Pomodoro timer", { body: message });
    } catch (error) {
      // Some browsers only allow notifications from a service worker.
    }
  }

  function complete() {
    const finished = mode;
    if (finished === "focus") {
      stats = addFocusRound(stats, dateKey(new Date()), settings.focus);
      save(STATS_KEY, stats);
      renderStats();
    }
    const upcoming = nextMode(finished, stats.cycle, settings.longEvery);
    setMode(upcoming, false);
    const message =
      MODE_LABELS[finished] + " finished. Next: " + MODE_LABELS[upcoming] + " (" + formatTime(remaining) + "). Press Start when you are ready.";
    say(message);
    beep();
    notify(message);
  }

  function skip() {
    const finished = mode;
    // A skipped focus round is not counted, so it never earns a long break.
    const upcoming = nextMode(finished, 0, settings.longEvery);
    setMode(upcoming, false);
    say("Skipped " + MODE_LABELS[finished] + ". Next: " + MODE_LABELS[upcoming] + " (" + formatTime(remaining) + ").");
  }

  function reset() {
    setMode(mode, false);
    say(MODE_LABELS[mode] + " reset to " + formatTime(remaining) + ".");
  }

  function applySettingsToInputs() {
    for (const key of Object.keys(inputs)) inputs[key].value = String(settings[key]);
    soundBox.checked = settings.sound;
    notifyBox.checked = settings.notify;
  }

  function readSettingsFromInputs() {
    const next = validateSettings({
      focus: inputs.focus.value,
      short: inputs.short.value,
      long: inputs.long.value,
      longEvery: inputs.longEvery.value,
      sound: soundBox.checked,
      notify: notifyBox.checked,
    });
    const untouched = !running && remaining === durationMs(mode, settings);
    settings = next;
    save(SETTINGS_KEY, settings);
    applySettingsToInputs();
    if (untouched) remaining = durationMs(mode, settings);
    settingsNote.textContent = "Settings saved in this browser.";
    renderStats();
    render();
  }

  startBtn.addEventListener("click", () => (running ? pause() : start()));
  resetBtn.addEventListener("click", reset);
  skipBtn.addEventListener("click", skip);
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode, true));
  });

  Object.values(inputs).forEach((input) => input.addEventListener("change", readSettingsFromInputs));

  soundBox.addEventListener("change", () => {
    if (soundBox.checked) {
      // Creating the audio context in a click handler satisfies autoplay rules.
      try {
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        // Ignored: beep() handles the missing context.
      }
    }
    readSettingsFromInputs();
    if (soundBox.checked) beep();
  });

  notifyBox.addEventListener("change", async () => {
    if (notifyBox.checked) {
      if (!("Notification" in window)) {
        notifyBox.checked = false;
        settingsNote.textContent = "This browser does not support notifications.";
        return;
      }
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          notifyBox.checked = false;
          readSettingsFromInputs();
          settingsNote.textContent = "Notifications were not allowed, so the timer will only use the page and title.";
          return;
        }
      }
    }
    readSettingsFromInputs();
  });

  resetStatsBtn.addEventListener("click", () => {
    stats = emptyStats(dateKey(new Date()));
    save(STATS_KEY, stats);
    renderStats();
    say("Today's counters were reset.");
  });

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest("input, select, textarea, button, a, summary")) return;
    if (event.key === " ") {
      event.preventDefault();
      running ? pause() : start();
    } else if (event.key === "r" || event.key === "R") {
      reset();
    } else if (event.key === "s" || event.key === "S") {
      skip();
    }
  });

  // Browsers slow timers in background tabs, so recalculate from the clock when the tab is visible again.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tick();
  });

  applySettingsToInputs();
  renderStats();
  render();
}

if (typeof document !== "undefined") {
  init();
} else {
  module.exports = {
    DEFAULT_SETTINGS,
    validateSettings,
    durationMs,
    remainingMs,
    nextMode,
    formatTime,
    titleText,
    progressFraction,
    dateKey,
    emptyStats,
    validateStats,
    addFocusRound,
    formatMinutes,
  };
}
