const test = require("node:test");
const assert = require("node:assert/strict");
const game = require("../js/wordle.js");

test("scoreGuess: all letters correct", () => {
  assert.deepEqual(game.scoreGuess("apple", "apple"), ["correct", "correct", "correct", "correct", "correct"]);
});

test("scoreGuess: repeated guess letter is only marked as many times as the answer has it", () => {
  assert.deepEqual(game.scoreGuess("speed", "abide"), ["absent", "absent", "present", "absent", "present"]);
});

test("scoreGuess: a correct letter wins over an earlier misplaced duplicate", () => {
  assert.deepEqual(game.scoreGuess("geese", "elite"), ["absent", "present", "absent", "absent", "correct"]);
});

test("scoreGuess: answer with a repeated letter", () => {
  assert.deepEqual(game.scoreGuess("robot", "floor"), ["present", "present", "absent", "correct", "absent"]);
});

test("scoreGuess: no shared letters", () => {
  assert.deepEqual(game.scoreGuess("quick", "sandy"), ["absent", "absent", "absent", "absent", "absent"]);
});

test("betterState keeps the best state", () => {
  assert.equal(game.betterState(undefined, "absent"), "absent");
  assert.equal(game.betterState("absent", "present"), "present");
  assert.equal(game.betterState("correct", "present"), "correct");
});

test("word lists contain only five-letter lowercase words without duplicates", () => {
  for (const list of [game.ANSWERS, game.EXTRA_WORDS]) {
    for (const word of list) assert.match(word, /^[a-z]{5}$/, word);
    assert.equal(new Set(list).size, list.length, "duplicate words");
  }
  assert.ok(game.ANSWERS.length >= 200);
});

test("getDailyWord is stable for a day and changes the next day", () => {
  const a = new Date(2026, 0, 10, 8, 0);
  const b = new Date(2026, 0, 10, 23, 30);
  const c = new Date(2026, 0, 11, 8, 0);
  assert.equal(game.getDailyWord(a), game.getDailyWord(b));
  assert.notEqual(game.getDailyWord(a), game.getDailyWord(c));
  assert.equal(game.dateKey(a), "2026-01-10");
});

test("validateStats accepts good data and rejects bad data", () => {
  const good = { played: 5, wins: 3, streak: 1, maxStreak: 2, distribution: [0, 1, 2, 0, 0, 0], lastDaily: "2026-01-10" };
  assert.deepEqual(game.validateStats(good), good);
  assert.deepEqual(game.validateStats(null), game.emptyStats());
  assert.deepEqual(game.validateStats({ ...good, wins: 9 }), game.emptyStats());
  assert.deepEqual(game.validateStats({ ...good, played: -1 }), game.emptyStats());
  assert.deepEqual(game.validateStats({ ...good, distribution: [1, 2] }), game.emptyStats());
  assert.deepEqual(game.validateStats({ ...good, lastDaily: "yesterday" }), game.emptyStats());
});

test("recordResult updates wins, streaks and distribution", () => {
  let stats = game.emptyStats();
  stats = game.recordResult(stats, true, 3);
  stats = game.recordResult(stats, true, 4);
  assert.equal(stats.streak, 2);
  assert.equal(stats.maxStreak, 2);
  assert.deepEqual(stats.distribution, [0, 0, 1, 1, 0, 0]);
  stats = game.recordResult(stats, false, 6);
  assert.equal(stats.streak, 0);
  assert.equal(stats.maxStreak, 2);
  assert.equal(stats.played, 3);
  assert.equal(game.winPercent(stats), 67);
  assert.equal(game.winPercent(game.emptyStats()), 0);
});

test("buildShareText makes an emoji grid", () => {
  const scores = [
    ["absent", "present", "absent", "absent", "correct"],
    ["correct", "correct", "correct", "correct", "correct"],
  ];
  assert.equal(game.buildShareText(scores, true, false), "Word guess 2/6\n\n⬛🟨⬛⬛🟩\n🟩🟩🟩🟩🟩");
  assert.match(game.buildShareText(scores, false, true), /^Word guess X\/6/);
});
