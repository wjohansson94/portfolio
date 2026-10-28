const test = require("node:test");
const assert = require("node:assert/strict");
const p = require("../js/pomodoro.js");

test("formatTime rounds up to whole seconds", () => {
  assert.equal(p.formatTime(25 * 60 * 1000), "25:00");
  assert.equal(p.formatTime(59 * 1000 + 1), "01:00");
  assert.equal(p.formatTime(1), "00:01");
  assert.equal(p.formatTime(0), "00:00");
  assert.equal(p.formatTime(-500), "00:00");
});

test("remainingMs uses timestamps and never goes below zero", () => {
  assert.equal(p.remainingMs(10000, 4000), 6000);
  assert.equal(p.remainingMs(10000, 10000), 0);
  assert.equal(p.remainingMs(10000, 999999), 0);
});

test("a long background pause still gives the right remaining time", () => {
  const start = 1_000_000;
  const end = start + 25 * 60 * 1000;
  // No ticks happened for 20 minutes, the clock alone gives the answer.
  assert.equal(p.formatTime(p.remainingMs(end, start + 20 * 60 * 1000)), "05:00");
});

test("nextMode gives a long break after every 4th focus round", () => {
  assert.equal(p.nextMode("focus", 1, 4), "short");
  assert.equal(p.nextMode("focus", 3, 4), "short");
  assert.equal(p.nextMode("focus", 4, 4), "long");
  assert.equal(p.nextMode("focus", 8, 4), "long");
  assert.equal(p.nextMode("focus", 0, 4), "short");
  assert.equal(p.nextMode("short", 1, 4), "focus");
  assert.equal(p.nextMode("long", 4, 4), "focus");
  assert.equal(p.nextMode("focus", 3, 3), "long");
});

test("durationMs and progressFraction", () => {
  assert.equal(p.durationMs("focus", p.DEFAULT_SETTINGS), 1_500_000);
  assert.equal(p.durationMs("short", p.DEFAULT_SETTINGS), 300_000);
  assert.equal(p.durationMs("long", p.DEFAULT_SETTINGS), 900_000);
  assert.equal(p.progressFraction(50, 100), 0.5);
  assert.equal(p.progressFraction(500, 100), 1);
  assert.equal(p.progressFraction(5, 0), 0);
});

test("titleText shows the time only while running", () => {
  assert.equal(p.titleText(65000, "focus", true), "01:05 \u00b7 Focus");
  assert.equal(p.titleText(65000, "short", true), "01:05 \u00b7 Short break");
  assert.match(p.titleText(65000, "focus", false), /^Pomodoro timer/);
});

test("validateSettings falls back to defaults and clamps values", () => {
  assert.deepEqual(p.validateSettings(null), p.DEFAULT_SETTINGS);
  assert.deepEqual(p.validateSettings("nonsense"), p.DEFAULT_SETTINGS);
  const s = p.validateSettings({ focus: "50", short: 0, long: 9999, longEvery: 2.5, sound: "yes", notify: true });
  assert.equal(s.focus, 50);
  assert.equal(s.short, 1);
  assert.equal(s.long, 120);
  assert.equal(s.longEvery, 4);
  assert.equal(s.sound, false);
  assert.equal(s.notify, true);
});

test("dateKey uses local date parts with padding", () => {
  assert.equal(p.dateKey(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(p.dateKey(new Date(2026, 11, 31)), "2026-12-31");
});

test("validateStats rejects bad data and resets daily numbers on a new day", () => {
  const today = "2026-10-14";
  assert.deepEqual(p.validateStats(null, today), p.emptyStats(today));
  assert.deepEqual(p.validateStats({ date: "x", rounds: 1, focusMinutes: 1, cycle: 1 }, today), p.emptyStats(today));
  assert.deepEqual(p.validateStats({ date: today, rounds: -1, focusMinutes: 0, cycle: 0 }, today), p.emptyStats(today));
  assert.deepEqual(p.validateStats({ date: today, rounds: "3", focusMinutes: 0, cycle: 0 }, today), p.emptyStats(today));
  const old = { date: "2026-10-13", rounds: 5, focusMinutes: 125, cycle: 2 };
  assert.deepEqual(p.validateStats(old, today), { date: today, rounds: 0, focusMinutes: 0, cycle: 2 });
  const same = { date: today, rounds: 2, focusMinutes: 50, cycle: 2 };
  assert.deepEqual(p.validateStats(same, today), same);
});

test("addFocusRound adds a round and minutes without changing the input", () => {
  const today = "2026-10-14";
  const before = { date: today, rounds: 1, focusMinutes: 25, cycle: 1 };
  const after = p.addFocusRound(before, today, 25);
  assert.deepEqual(after, { date: today, rounds: 2, focusMinutes: 50, cycle: 2 });
  assert.equal(before.rounds, 1);
});

test("formatMinutes", () => {
  assert.equal(p.formatMinutes(0), "0 min");
  assert.equal(p.formatMinutes(45), "45 min");
  assert.equal(p.formatMinutes(125), "2 h 5 min");
});
