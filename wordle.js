"use strict";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const STATS_KEY = "wordGuess.stats";
const CONTRAST_KEY = "wordGuess.highContrast";
const REVEAL_DELAY_MS = 300;

// Words that can be picked as the secret answer.
const ANSWERS = `
about above actor adult after again agree ahead alarm album alert alive allow alone along among angle angry apart apple
apply arena argue arise array aside asset avoid awake award aware basic beach beard begin being below bench black blame
blank blind block blood board boost brain brand bread break brick bride brief bring broad brown build burst buyer cable
candy carry catch cause chain chair chalk charm chart chase cheap check cheek chess chest chief child chill civil claim
class clean clear clerk click climb clock close cloud coach coast couch count court cover craft crane crash cream crime
cross crowd crown cycle daily dance death delay depth dirty doubt dozen draft drama dream dress drink drive eager early
earth eight elbow empty enemy enjoy enter equal error event every exact exist extra faith false fancy fault field fifth
fight final first flame flash fleet floor focus force forge forth found frame fresh front fruit funny giant given glass
globe glory grace grade grain grand grant grape grass great green greet grill group guard guess guest guide habit happy
harsh heart heavy hence honey horse hotel house human humor ideal image index inner input issue ivory joint judge juice
knife known label large laser later laugh layer learn least leave legal lemon level light limit local logic loose lucky
lunch magic major maker march match maybe mayor media metal might minor mixed model money month moral motor mount mouse
mouth movie music naive nerve never newly night noise north novel nurse ocean offer often olive onion order other ought
outer owner paint panel paper party pasta patch pause peace pearl phase phone photo piano piece pilot pitch place plain
plane plant plate point power press price pride prime print prize proof proud queen quick quiet quite radio raise range
rapid ratio reach ready right river robot rough round route royal rural salad scale scene scope score sense serve seven
shade shake shape share sharp sheep sheet shelf shell shift shine shirt shock shoot short shown sight silly since skill
sleep slice slide small smart smile smoke snake solid solve sorry sound south space spare speak speed spell spend spice
split spoke sport staff stage stair stamp stand start state steam steel stick still stone store storm story strip study
stuff style sugar suite sunny super sweet table taste teach thank their theme there thick thing think third those three
throw tight timer title toast today tooth topic total touch tough tower trace track trade train treat trend trial tribe
trick truck truly trust truth twice uncle under union unity until upper urban usage usual valid value video visit vital
voice waste watch water wheel where which while white whole whose woman world worry worth would write wrong young youth
`
  .trim()
  .split(/\s+/);

// Extra real words that are accepted as guesses but never picked as the answer.
const EXTRA_WORDS = `
abbey abide acute adapt admit adopt aging agile aloud amber ample angel anger ankle annex apron arrow ashes attic audio
avail bacon badge baker basis batch beast beige belly berry bible birth blade blast blaze bleak bless bloom blues blush
boast bonus booth bound brave breed broke brush bunch cabin camel canal cargo carol carve cease chaos cheer chunk cider
cigar clash clasp cliff cling cloth clown coral cough crack cramp crisp crush curve dealt decay decor decoy delta demon
dense devil diary digit diner dodge donor drawn drift drill drove dryer dwell eagle eaten elder elite email ember enact
entry envoy equip erase essay ethic evade evoke exile fable facet fairy fatal feast fence ferry fever fiber fiery filmy
flair flask flesh flock flood flora flour fluid flute foggy forum foyer frail frank fraud freed fried frost fully fungi
gamma gauge genie genre ghost gleam glide gloom glove glued gnome goose gorge grave gravy greed grief grind gripe groan
grove growl grown gruff guild guilt haste haunt haven hazel heard hedge hello hinge hobby holly hover hurry hyper icing
idiom inbox inept infer ingot irony jazzy jelly jewel joker jolly kneel knock koala lance latch leapt ledge lever lilac
linen liver lobby lodge lover lower loyal lyric madam manor maple marsh mason medal melon mercy merge merit messy micro
midst mirth moist molar moose mossy motel motto mound mourn muddy mural nasty naval needy niche ninth noble nomad notch
nudge oasis occur opera optic orbit organ otter ounce outdo oxide ozone paddy panic pants parka patio pedal penny perch
peril petal piety pixel pizza plaid plank plaza pluck plumb plume plump plush poach poise polar polka porch poser pouch
pound prank prawn prone prose prove prune pulse punch pupil puppy purse quake quart quest quilt quirk quota quote rainy
rally ranch rebel reign relax relay relic remix renew repay reply resin rider ridge rifle rigid rinse risky rival roast
robin rocky rogue roost rouge rower rusty saint salon sandy sauce sauna scarf scary scent scout scrap screw seize shaft
shame shawl shear shiny shore shove shrub shrug siege sixth sixty skate skirt skull slang slash slate
slave sleek sleet slope sloth smash smell smirk snack snail snore sober solar sonic spade spark spear spine spoon spray
squad stack stain stalk stark stern stiff sting stink stock stool stove strap straw stray strut sunup surge swamp swarm
swear sweep swift swing sword syrup tango taper tardy teeth tempo tenor tense tenth thief thorn thumb thump tidal tiger
timid tipsy titan toxic trail trait tramp trash tread triad troop trout tulip tuner tutor twist ultra unfit unify unite
untie upset usher utter vague valve vapor vault venue verse vicar vigor viral vivid vocal voter vowel wagon waist waltz
weary weave wedge weigh weird whale wheat whirl whisk widen widow width wield witch wound wrath wreck wrist yacht yearn
yield zebra
`
  .trim()
  .split(/\s+/);

const ALLOWED = new Set([...ANSWERS, ...EXTRA_WORDS]);

// Returns one state per letter: "correct", "present" or "absent".
// Pass 1 marks exact matches; pass 2 marks misplaced letters, but only
// as many times as that letter is still unused in the answer.
function scoreGuess(guess, answer) {
  const result = Array(guess.length).fill("absent");
  const unused = {};

  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
    } else {
      unused[answer[i]] = (unused[answer[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] !== "correct" && unused[guess[i]] > 0) {
      result[i] = "present";
      unused[guess[i]] -= 1;
    }
  }

  return result;
}

// A letter on the keyboard keeps its best state: correct > present > absent.
function betterState(oldState, newState) {
  const rank = { absent: 1, present: 2, correct: 3 };
  return (rank[newState] || 0) > (rank[oldState] || 0) ? newState : oldState;
}

function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Same local calendar day gives the same word, with no server.
function getDailyWord(date) {
  const days = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return ANSWERS[days % ANSWERS.length];
}

function emptyStats() {
  return { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0], lastDaily: null };
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0 && value <= 1000000;
}

// Never trust stored data: anything unexpected falls back to empty stats.
function validateStats(raw) {
  if (!raw || typeof raw !== "object") return emptyStats();

  const { played, wins, streak, maxStreak, distribution, lastDaily } = raw;
  const distributionOk =
    Array.isArray(distribution) && distribution.length === MAX_GUESSES && distribution.every(isCount);
  const dailyOk = lastDaily === null || (typeof lastDaily === "string" && /^\d{4}-\d{2}-\d{2}$/.test(lastDaily));

  if (![played, wins, streak, maxStreak].every(isCount) || !distributionOk || !dailyOk || wins > played) {
    return emptyStats();
  }

  return { played, wins, streak, maxStreak, distribution: [...distribution], lastDaily };
}

// Returns new stats after one finished game. guessCount is only used for wins.
function recordResult(stats, won, guessCount) {
  const next = { ...stats, distribution: [...stats.distribution], played: stats.played + 1 };

  if (won) {
    next.wins += 1;
    next.streak += 1;
    next.maxStreak = Math.max(next.maxStreak, next.streak);
    next.distribution[guessCount - 1] += 1;
  } else {
    next.streak = 0;
  }

  return next;
}

function winPercent(stats) {
  return stats.played === 0 ? 0 : Math.round((stats.wins / stats.played) * 100);
}

function buildShareText(scores, won, highContrast) {
  const emoji = highContrast
    ? { correct: "🟦", present: "🟧", absent: "⬛" }
    : { correct: "🟩", present: "🟨", absent: "⬛" };
  const title = `Word guess ${won ? scores.length : "X"}/${MAX_GUESSES}`;
  const rows = scores.map((row) => row.map((state) => emoji[state]).join(""));
  return [title, "", ...rows].join("\n");
}

function init() {
  const board = document.getElementById("board");
  const keyboard = document.getElementById("keyboard");
  const statusEl = document.getElementById("status");
  const modeSelect = document.getElementById("mode");
  const contrastBox = document.getElementById("contrast");
  const dialog = document.getElementById("result-dialog");
  const shareStatus = document.getElementById("share-status");
  const shareTextEl = document.getElementById("share-text");

  const STATE_TEXT = {
    correct: "correct",
    present: "in the word, wrong place",
    absent: "not in the word",
  };
  const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let game;
  let stats = loadStats();
  let keyStates = {};
  let tiles = [];

  function loadStats() {
    try {
      return validateStats(JSON.parse(localStorage.getItem(STATS_KEY)));
    } catch (error) {
      return emptyStats();
    }
  }

  function saveStats() {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      say("Could not save your stats in this browser.");
    }
  }

  function say(message) {
    statusEl.textContent = message;
  }

  function buildBoard() {
    board.replaceChildren();
    tiles = [];

    for (let r = 0; r < MAX_GUESSES; r++) {
      const row = document.createElement("div");
      row.className = "board-row";
      row.setAttribute("role", "row");
      const rowTiles = [];

      for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.setAttribute("role", "gridcell");
        row.append(tile);
        rowTiles.push(tile);
      }

      board.append(row);
      tiles.push(rowTiles);
    }
  }

  function buildKeyboard() {
    keyboard.replaceChildren();

    KEY_ROWS.forEach((letters, index) => {
      const row = document.createElement("div");
      row.className = "key-row";

      if (index === 2) row.append(makeKey("Enter", "Enter", "Enter", true));
      for (const letter of letters) row.append(makeKey(letter, letter.toUpperCase(), letter));
      if (index === 2) row.append(makeKey("Backspace", "⌫", "Delete", true));

      keyboard.append(row);
    });
  }

  function makeKey(key, text, label, wide) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = wide ? "key key-wide" : "key";
    button.dataset.key = key;
    button.textContent = text;
    button.setAttribute("aria-label", label);
    return button;
  }

  function updateKeyboard() {
    for (const button of keyboard.querySelectorAll(".key")) {
      const key = button.dataset.key;
      const state = keyStates[key];
      if (key.length !== 1) continue;

      if (state) {
        button.dataset.state = state;
        button.setAttribute("aria-label", `${key}, ${STATE_TEXT[state]}`);
      } else {
        delete button.dataset.state;
        button.setAttribute("aria-label", key);
      }
    }
  }

  function setTileLabel(r, c) {
    const tile = tiles[r][c];
    const letter = tile.textContent;
    const where = `Row ${r + 1}, letter ${c + 1}`;

    if (!letter) {
      tile.setAttribute("aria-label", `${where}, empty`);
    } else if (tile.dataset.state) {
      tile.setAttribute("aria-label", `${where}: ${letter}, ${STATE_TEXT[tile.dataset.state]}`);
    } else {
      tile.setAttribute("aria-label", `${where}: ${letter}`);
    }
  }

  function renderCurrentRow() {
    const r = game.guesses.length;
    if (r >= MAX_GUESSES) return;

    for (let c = 0; c < WORD_LENGTH; c++) {
      const letter = game.current[c] || "";
      tiles[r][c].textContent = letter.toUpperCase();
      tiles[r][c].classList.toggle("filled", letter !== "");
      setTileLabel(r, c);
    }
  }

  function startGame(mode) {
    const answer = mode === "daily" ? getDailyWord(new Date()) : ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    game = { answer, mode, guesses: [], scores: [], current: "", over: false, busy: false };
    keyStates = {};
    buildBoard();
    for (let r = 0; r < MAX_GUESSES; r++) {
      for (let c = 0; c < WORD_LENGTH; c++) setTileLabel(r, c);
    }
    updateKeyboard();
    say(mode === "daily" ? "New game. Word of the day." : "New game. Guess the five-letter word.");
  }

  function handleKey(key) {
    if (game.over || game.busy) return;

    if (key === "Enter") {
      submitGuess();
    } else if (key === "Backspace") {
      game.current = game.current.slice(0, -1);
      renderCurrentRow();
    } else if (/^[a-z]$/.test(key) && game.current.length < WORD_LENGTH) {
      game.current += key;
      renderCurrentRow();
    }
  }

  function submitGuess() {
    if (game.current.length < WORD_LENGTH) {
      say("Not enough letters.");
      return;
    }
    if (!ALLOWED.has(game.current)) {
      say(`${game.current.toUpperCase()} is not in the word list.`);
      return;
    }

    const guess = game.current;
    const scores = scoreGuess(guess, game.answer);
    const r = game.guesses.length;
    game.guesses.push(guess);
    game.scores.push(scores);
    game.current = "";
    game.busy = true;
    revealRow(r, guess, scores);
  }

  function revealRow(r, guess, scores) {
    const instant = reducedMotion.matches;

    scores.forEach((state, c) => {
      const show = () => {
        tiles[r][c].dataset.state = state;
        setTileLabel(r, c);
      };

      if (instant) {
        show();
      } else {
        tiles[r][c].classList.add("flip");
        tiles[r][c].style.animationDelay = `${c * REVEAL_DELAY_MS}ms`;
        setTimeout(show, c * REVEAL_DELAY_MS + REVEAL_DELAY_MS / 2);
      }
    });

    if (instant) {
      finishRow(r, guess, scores);
    } else {
      setTimeout(() => finishRow(r, guess, scores), WORD_LENGTH * REVEAL_DELAY_MS);
    }
  }

  function finishRow(r, guess, scores) {
    guess.split("").forEach((letter, c) => {
      keyStates[letter] = betterState(keyStates[letter], scores[c]);
    });
    updateKeyboard();
    game.busy = false;

    const summary = guess
      .split("")
      .map((letter, c) => `${letter.toUpperCase()} ${STATE_TEXT[scores[c]]}`)
      .join(", ");
    const won = guess === game.answer;
    const lost = !won && game.guesses.length === MAX_GUESSES;

    if (won || lost) {
      game.over = true;
      finishGame(won);
    } else {
      say(`Guess ${r + 1}: ${summary}.`);
    }
  }

  function finishGame(won) {
    const today = dateKey(new Date());
    const countable = !(game.mode === "daily" && stats.lastDaily === today);
    let note = "";

    if (countable) {
      stats = recordResult(stats, won, game.guesses.length);
      if (game.mode === "daily") stats.lastDaily = today;
      saveStats();
      renderStats();
    } else {
      note = " Today's word of the day was already counted in your stats.";
    }

    const title = won ? "You got it!" : "Out of guesses";
    const text = won
      ? `You found ${game.answer.toUpperCase()} in ${game.guesses.length} of ${MAX_GUESSES} guesses.${note}`
      : `The word was ${game.answer.toUpperCase()}.${note}`;

    document.getElementById("result-title").textContent = title;
    document.getElementById("result-text").textContent = text;
    shareTextEl.textContent = buildShareText(game.scores, won, contrastBox.checked);
    shareStatus.textContent = "";
    say(`${title} ${text}`);

    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  function renderStats() {
    document.getElementById("stat-played").textContent = stats.played;
    document.getElementById("stat-win").textContent = winPercent(stats);
    document.getElementById("stat-streak").textContent = stats.streak;
    document.getElementById("stat-best").textContent = stats.maxStreak;

    const list = document.getElementById("distribution");
    const most = Math.max(1, ...stats.distribution);
    list.replaceChildren();

    stats.distribution.forEach((count, index) => {
      const item = document.createElement("li");
      const label = document.createElement("span");
      const bar = document.createElement("span");
      label.textContent = index + 1;
      bar.className = "bar";
      bar.textContent = count;
      bar.style.width = `${Math.max(8, (count / most) * 100)}%`;
      item.append(label, bar);
      list.append(item);
    });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (copyError) {
        ok = false;
      }
      area.remove();
      return ok;
    }
  }

  function applyContrast(on) {
    document.documentElement.toggleAttribute("data-contrast", on);
    contrastBox.checked = on;
  }

  keyboard.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    handleKey(button.dataset.key);
    // After a mouse or touch tap, release focus so the physical Enter key does not press this key again.
    if (event.detail > 0) button.blur();
  });

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || dialog.open) return;
    if (event.target.closest("select, input, textarea")) return;
    // A focused button handles Enter itself, so skip it here to avoid sending twice.
    if (event.key === "Enter" && event.target.closest("button, a")) return;

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === "Enter" || key === "Backspace" || /^[a-z]$/.test(key)) {
      event.preventDefault();
      handleKey(key);
    }
  });

  // Focus the board after starting so typing works right away.
  function restart() {
    startGame(modeSelect.value);
    board.focus();
  }

  document.getElementById("new-game").addEventListener("click", restart);
  modeSelect.addEventListener("change", restart);
  document.getElementById("play-again").addEventListener("click", () => {
    dialog.close();
    restart();
  });
  document.getElementById("close-dialog").addEventListener("click", () => dialog.close());

  document.getElementById("share").addEventListener("click", async () => {
    const ok = await copyText(shareTextEl.textContent);
    shareStatus.textContent = ok ? "Result copied to the clipboard." : "Could not copy automatically. Select the text above and copy it.";
  });

  contrastBox.addEventListener("change", () => {
    applyContrast(contrastBox.checked);
    try {
      localStorage.setItem(CONTRAST_KEY, contrastBox.checked ? "1" : "0");
    } catch (error) {
      // The setting just will not be remembered.
    }
  });

  document.getElementById("reset-stats").addEventListener("click", () => {
    if (window.confirm("Reset all your Word guess statistics?")) {
      stats = emptyStats();
      saveStats();
      renderStats();
      say("Statistics reset.");
    }
  });

  try {
    applyContrast(localStorage.getItem(CONTRAST_KEY) === "1");
  } catch (error) {
    applyContrast(false);
  }

  board.setAttribute("tabindex", "-1");
  buildKeyboard();
  renderStats();
  startGame("random");
}

if (typeof document !== "undefined") {
  init();
} else {
  module.exports = {
    ANSWERS,
    EXTRA_WORDS,
    scoreGuess,
    betterState,
    getDailyWord,
    dateKey,
    validateStats,
    recordResult,
    winPercent,
    buildShareText,
    emptyStats,
  };
}
