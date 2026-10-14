"use strict";

// Nothing here sends, stores or logs a password.

const COMMON_PASSWORDS = [
  "password", "123456", "12345678", "123456789", "qwerty", "qwerty123", "abc123",
  "111111", "123123", "000000", "iloveyou", "admin", "welcome", "monkey",
  "dragon", "letmein", "football", "baseball", "master", "sunshine", "princess",
  "login", "passw0rd", "starwars", "hello", "freedom", "whatever", "trustno1",
  "superman", "batman", "michael", "shadow", "summer", "winter", "secret",
  "changeme", "welcome1", "p@ssw0rd", "zaq12wsx", "1q2w3e4r", "qazwsx",
  "asdfgh", "asdfghjkl", "zxcvbnm", "654321", "666666", "121212", "1234567",
  "1234567890", "lovely", "computer", "internet", "hunter2", "test", "guest",
];

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

const WORDS = (
  "able acid aged also area army atom aunt baby back bake ball band bank barn base bath bead beam bean bear beat bell belt bend bike bill bird bite blue boat body bold bolt bone book boot born boss bowl bulb bulk burn bush busy cafe cage cake calm camp card care cart case cash cave cell chef chin chip city clay clip club coal coat code coin cold comb cook cool copy cord corn cost crew crop cube curb curl dark dart dash data dawn deal deck deep deer desk dial dice dish dive dock dome door dove down draw drum duck dust duty each earn east easy edge exit face fact fair farm fast fern file film fire fish five flag flat flip foam fold food foot fork form fort frog fuel full gain game gate gear gift glad glow glue goat gold golf good gown grab gray grid grip gulf hair half hall hand harp hawk heat help herb hill hold hole home hood hook hope horn hose hunt idea iron isle jade jazz join jump jury keen keep kite knee knot lake lamp land lane lark lawn leaf lend lens lift lime line link lion list load loaf lock loft long loop lord luck lunch mail main maple mask mast meal melt menu mild milk mind mint moon moss moth nail navy neat nest news nice node noon note oak oasis ocean olive open oval pace pack page pair palm park path peak pear pine pink plan plum pond pool port quiet rain ramp reed rice ring road rock roof rope rose sail salt sand seed shed ship silk snow soap song soup star tide tree wave wind wolf wood yard zone"
).split(" ");

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};
const AMBIGUOUS = "Il1O0o";

const LEVELS = [
  { label: "Very weak", min: 0 },
  { label: "Weak", min: 28 },
  { label: "Fair", min: 40 },
  { label: "Strong", min: 60 },
  { label: "Very strong", min: 80 },
];

const GUESSES_PER_SECOND = 1e10;

const $ = (id) => document.getElementById(id);
const els = {
  status: $("status"),
  input: $("check-input"),
  toggle: $("toggle-visibility"),
  meterFill: $("meter-fill"),
  label: $("strength-label"),
  announce: $("strength-announce"),
  details: $("check-details"),
  length: $("detail-length"),
  bits: $("detail-bits"),
  time: $("detail-time"),
  timeNote: $("time-note"),
  feedbackHeading: $("feedback-heading"),
  feedbackList: $("feedback-list"),
  form: $("gen-form"),
  modeRandom: $("mode-random"),
  modePhrase: $("mode-phrase"),
  randomOptions: $("random-options"),
  phraseOptions: $("phrase-options"),
  lengthSlider: $("length"),
  lengthOutput: $("length-output"),
  lower: $("opt-lower"),
  upper: $("opt-upper"),
  digits: $("opt-digits"),
  symbols: $("opt-symbols"),
  ambiguous: $("opt-ambiguous"),
  words: $("words"),
  wordsOutput: $("words-output"),
  separator: $("separator"),
  capitalize: $("opt-capitalize"),
  number: $("opt-number"),
  genError: $("gen-error"),
  resultBox: $("result-box"),
  generated: $("generated"),
  copy: $("copy-button"),
  generatedInfo: $("generated-info"),
};

/* ---------- Secure randomness ---------- */

// Rejection sampling: a plain "random % max" would favour small numbers.
function randomInt(max) {
  const range = 2 ** 32;
  const limit = range - (range % max);
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

function pick(text) {
  return text[randomInt(text.length)];
}

function secureShuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/* ---------- Strength checking ---------- */

function poolSize(password) {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^A-Za-z0-9]/.test(password)) size += 33;
  return size;
}

function normalise(password) {
  const leet = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };
  return password.toLowerCase().replace(/[013457@$!]/g, (char) => leet[char]);
}

function isCommon(password) {
  const lower = password.toLowerCase();
  const stripped = lower.replace(/[0-9!@#$%^&*._-]+$/, "");
  const common = COMMON_PASSWORDS.map(normalise);
  const candidates = [lower, stripped, normalise(lower), normalise(stripped)];
  return candidates.some(
    (item) => item !== "" && (COMMON_PASSWORDS.includes(item) || common.includes(item))
  );
}

// Returns how many characters are "wasted" by a repeated character run (aaa).
function findRepeats(password) {
  let wasted = 0;
  const runs = password.match(/(.)\1{2,}/g) || [];
  runs.forEach((run) => {
    wasted += run.length - 1;
  });
  return wasted;
}

// Finds runs of 3+ characters going up or down by one: abc, 321.
function findSequences(password) {
  const text = password.toLowerCase();
  let wasted = 0;
  let found = false;
  let runLength = 1;
  let direction = 0;

  const endRun = () => {
    if (runLength >= 3) {
      wasted += runLength - 1;
      found = true;
    }
  };

  for (let i = 1; i < text.length; i++) {
    const step = text.charCodeAt(i) - text.charCodeAt(i - 1);
    if ((step === 1 || step === -1) && (direction === 0 || direction === step)) {
      direction = step;
      runLength += 1;
    } else {
      endRun();
      const startsNew = step === 1 || step === -1;
      direction = startsNew ? step : 0;
      runLength = startsNew ? 2 : 1;
    }
  }
  endRun();
  return { wasted, found };
}

// Finds 4+ characters that sit next to each other on a keyboard row, in either direction.
function findKeyboardWalks(password) {
  const text = password.toLowerCase();
  let wasted = 0;
  let found = false;
  const rows = KEYBOARD_ROWS.concat(KEYBOARD_ROWS.map((row) => [...row].reverse().join("")));

  let i = 0;
  while (i <= text.length - 4) {
    let matched = 0;
    for (const row of rows) {
      let length = 4;
      if (row.includes(text.slice(i, i + 4))) {
        while (i + length < text.length && row.includes(text.slice(i, i + length + 1))) {
          length += 1;
        }
        matched = Math.max(matched, length);
      }
    }
    if (matched > 0) {
      wasted += matched - 1;
      found = true;
      i += matched;
    } else {
      i += 1;
    }
  }
  return { wasted, found };
}

function levelIndexFor(bits) {
  let index = 0;
  LEVELS.forEach((level, i) => {
    if (bits >= level.min) {
      index = i;
    }
  });
  return index;
}

function levelFor(bits) {
  return LEVELS[levelIndexFor(bits)];
}

function analyse(password) {
  const length = password.length;
  const pool = poolSize(password);
  const repeats = findRepeats(password);
  const sequences = findSequences(password);
  const walks = findKeyboardWalks(password);
  const common = isCommon(password);

  // A sequence and a keyboard walk can cover the same characters (12345), so count the larger one only.
  const patternWaste = Math.max(sequences.wasted, walks.wasted);
  const effectiveLength = Math.max(1, length - repeats - patternWaste);
  let bits = effectiveLength * Math.log2(Math.max(pool, 2));
  if (common) {
    bits = Math.min(bits, 12);
  }

  const levelIndex = levelIndexFor(bits);
  let levelIndexFinal = levelIndex;
  if (length < 8) {
    levelIndexFinal = Math.min(levelIndex, 1);
  }
  if (common) {
    levelIndexFinal = 0;
  }

  return {
    length,
    pool,
    bits,
    levelIndex: levelIndexFinal,
    common,
    repeats: repeats > 0,
    sequences: sequences.found,
    walks: walks.found,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
}

function formatDuration(seconds) {
  if (seconds < 1) return "less than a second";
  const units = [
    ["year", 31557600],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  if (seconds >= 31557600 * 1e9) return "more than a billion years";
  if (seconds >= 31557600 * 1e6) return "millions of years";
  if (seconds >= 31557600 * 1e3) return "thousands of years";
  for (const [name, size] of units) {
    if (seconds >= size) {
      const count = Math.floor(seconds / size);
      return `about ${count.toLocaleString("en-US")} ${name}${count === 1 ? "" : "s"}`;
    }
  }
  return "less than a second";
}

function crackTime(bits) {
  // On average an attacker finds the password after trying half of all possibilities.
  const seconds = 2 ** (bits - 1) / GUESSES_PER_SECOND;
  return formatDuration(seconds);
}

function suggestions(result) {
  const list = [];
  if (result.common) {
    list.push("This looks like a very common password (or a small change to one). Attackers try these first.");
  }
  if (result.length < 12) {
    list.push(`Make it longer. ${result.length} characters is short; aim for at least 12, or 16 or more.`);
  }
  if (result.repeats) {
    list.push("Avoid repeated characters such as \"aaa\".");
  }
  if (result.sequences) {
    list.push("Avoid sequences such as \"abc\" or \"1234\".");
  }
  if (result.walks) {
    list.push("Avoid keyboard patterns such as \"qwerty\" or \"asdf\".");
  }
  const missing = [];
  if (!result.hasLower) missing.push("lowercase letters");
  if (!result.hasUpper) missing.push("uppercase letters");
  if (!result.hasDigit) missing.push("digits");
  if (!result.hasSymbol) missing.push("symbols");
  if (missing.length > 0 && result.length < 16) {
    list.push(`Mix in more character types: ${missing.join(", ")}.`);
  }
  if (list.length === 0) {
    list.push("No obvious problems found. Remember to use a unique password for every account.");
  }
  return list;
}

let announceTimer = null;
let lastAnnounced = "";

function announceStrength(text) {
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    if (text !== lastAnnounced) {
      lastAnnounced = text;
      els.announce.textContent = text;
    }
  }, 700);
}

function renderCheck() {
  const password = els.input.value;

  if (password === "") {
    els.meterFill.dataset.level = "0";
    els.meterFill.style.width = "0";
    els.label.textContent = "Type a password to see its strength.";
    els.details.hidden = true;
    els.timeNote.hidden = true;
    els.feedbackHeading.hidden = true;
    els.feedbackList.replaceChildren();
    lastAnnounced = "";
    announceStrength("");
    return;
  }

  const result = analyse(password);
  const level = LEVELS[result.levelIndex];

  els.meterFill.dataset.level = String(result.levelIndex + 1);
  els.meterFill.style.width = `${(result.levelIndex + 1) * 20}%`;
  els.label.textContent = `Strength: ${level.label}`;
  els.length.textContent = String(result.length);
  els.bits.textContent = `${Math.round(result.bits)} bits`;
  els.time.textContent = crackTime(result.bits);
  els.details.hidden = false;
  els.timeNote.hidden = false;

  els.feedbackList.replaceChildren();
  suggestions(result).forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    els.feedbackList.append(item);
  });
  els.feedbackHeading.hidden = false;

  announceStrength(`Strength: ${level.label}`);
}

/* ---------- Generator ---------- */

function buildRandomPassword() {
  const sets = [];
  [
    [els.lower, "lower"],
    [els.upper, "upper"],
    [els.digits, "digits"],
    [els.symbols, "symbols"],
  ].forEach(([checkbox, key]) => {
    if (!checkbox.checked) return;
    let chars = SETS[key];
    if (els.ambiguous.checked) {
      chars = [...chars].filter((char) => !AMBIGUOUS.includes(char)).join("");
    }
    sets.push(chars);
  });

  if (sets.length === 0) {
    return null;
  }

  const length = Number(els.lengthSlider.value);
  const all = sets.join("");
  // One character from every chosen set, so each option is really used.
  const chars = sets.map(pick);
  while (chars.length < length) {
    chars.push(pick(all));
  }
  secureShuffle(chars);

  return {
    text: chars.join(""),
    bits: length * Math.log2(all.length),
    description: `${length} random characters from a pool of ${all.length}`,
  };
}

function buildPassphrase() {
  const count = Number(els.words.value);
  const words = [];
  for (let i = 0; i < count; i++) {
    let word = WORDS[randomInt(WORDS.length)];
    if (els.capitalize.checked) {
      word = word[0].toUpperCase() + word.slice(1);
    }
    words.push(word);
  }
  let text = words.join(els.separator.value);
  let bits = count * Math.log2(WORDS.length);
  if (els.number.checked) {
    text += String(randomInt(100));
    bits += Math.log2(100);
  }
  return {
    text,
    bits,
    description: `${count} words chosen at random from a built-in list of ${WORDS.length}`,
  };
}

function generate() {
  const phrase = els.modePhrase.checked;
  const result = phrase ? buildPassphrase() : buildRandomPassword();

  if (result === null) {
    els.genError.textContent = "Choose at least one type of character.";
    els.genError.hidden = false;
    els.resultBox.hidden = true;
    return;
  }

  els.genError.hidden = true;
  els.generated.value = result.text;
  const level = levelFor(result.bits);
  els.generatedInfo.textContent =
    `${result.description}. About ${Math.round(result.bits)} bits of entropy (${level.label.toLowerCase()}). ` +
    `Rough time to guess: ${crackTime(result.bits)}.`;
  els.resultBox.hidden = false;
  els.status.textContent = "";
  els.status.textContent = "New password generated.";
}

async function copyGenerated() {
  const text = els.generated.value;
  if (text === "") return;

  try {
    await navigator.clipboard.writeText(text);
    els.status.textContent = "Copied to the clipboard.";
    return;
  } catch (error) {
    // Falls through to the older method below.
  }

  els.generated.select();
  els.generated.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }
  els.status.textContent = copied
    ? "Copied to the clipboard."
    : "Could not copy automatically. The password is selected, so press Ctrl+C (or Cmd+C).";
}

/* ---------- Events ---------- */

els.input.addEventListener("input", renderCheck);

els.toggle.addEventListener("click", () => {
  const show = els.input.type === "password";
  els.input.type = show ? "text" : "password";
  els.toggle.textContent = show ? "Hide" : "Show";
  els.toggle.setAttribute("aria-pressed", String(show));
});

[els.modeRandom, els.modePhrase].forEach((radio) => {
  radio.addEventListener("change", () => {
    const phrase = els.modePhrase.checked;
    els.randomOptions.hidden = phrase;
    els.phraseOptions.hidden = !phrase;
    els.genError.hidden = true;
  });
});

els.lengthSlider.addEventListener("input", () => {
  els.lengthOutput.textContent = els.lengthSlider.value;
});
els.words.addEventListener("input", () => {
  els.wordsOutput.textContent = els.words.value;
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});
els.copy.addEventListener("click", copyGenerated);

renderCheck();
