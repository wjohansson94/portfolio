const cardFaces = [
  { value: "rocket", symbol: "🚀", label: "Rocket" },
  { value: "headphones", symbol: "🎧", label: "Headphones" },
  { value: "game", symbol: "🎮", label: "Game controller" },
  { value: "computer", symbol: "💻", label: "Laptop" },
  { value: "puzzle", symbol: "🧩", label: "Puzzle piece" },
  { value: "art", symbol: "🎨", label: "Palette" },
  { value: "battery", symbol: "🔋", label: "Battery" },
  { value: "moon", symbol: "🌙", label: "Crescent moon" },
  { value: "sun", symbol: "☀️", label: "Sun" },
  { value: "star", symbol: "⭐", label: "Star" },
  { value: "cloud", symbol: "☁️", label: "Cloud" },
  { value: "fire", symbol: "🔥", label: "Flame" },
];

const gameBoard = document.querySelector("#game-board");
const moveCount = document.querySelector("#move-count");
const timerDisplay = document.querySelector("#timer");
const gameStatus = document.querySelector("#game-status");
const restartButton = document.querySelector("#restart-button");
const difficultySelect = document.querySelector("#difficulty-select");
const bestScoreDisplay = document.querySelector("#best-score");
const winPanel = document.querySelector("#win-panel");
const winMessage = document.querySelector("#win-message");
const bestMessage = document.querySelector("#best-message");
const playAgainButton = document.querySelector("#play-again-button");

const difficulties = {
  easy: { pairs: 6, columns: 4 },
  medium: { pairs: 8, columns: 4 },
  hard: { pairs: 12, columns: 6 },
};

let firstCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let secondsElapsed = 0;
let timerInterval = null;
let mismatchTimeout = null;
let gameFinished = false;
let activePairCount = difficulties[difficultySelect.value].pairs;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function startTimer() {
  if (timerInterval !== null) {
    return;
  }

  timerInterval = window.setInterval(function () {
    secondsElapsed += 1;
    timerDisplay.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function shuffle(cards) {
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]];
  }

  return cards;
}

function createCard(face, index) {
  const card = document.createElement("button");
  card.className = "memory-card";
  card.type = "button";
  card.dataset.value = face.value;
  card.dataset.label = face.label;
  card.textContent = face.symbol;
  card.setAttribute("aria-label", `Hidden card ${index + 1}`);
  card.setAttribute("aria-pressed", "false");
  return card;
}

function updateTimer() {
  timerDisplay.textContent = formatTime(secondsElapsed);
}

function finishGame() {
  window.clearInterval(timerInterval);
  timerInterval = null;
  gameFinished = true;
  const difficulty = difficultySelect.value;
  const previousBest = getBestScore(difficulty);
  const isNewBest =
    previousBest === null ||
    moves < previousBest.moves ||
    (moves === previousBest.moves && secondsElapsed < previousBest.seconds);
  const score = { moves, seconds: secondsElapsed };
  let savedNewBest = true;

  if (isNewBest) {
    savedNewBest = saveBestScore(difficulty, score);
  }

  gameStatus.textContent =
    `Board cleared in ${moves} moves and ${formatTime(secondsElapsed)}.`;
  winMessage.textContent =
    `${difficultySelect.options[difficultySelect.selectedIndex].text.split(" · ")[0]}: ${moves} moves in ${formatTime(secondsElapsed)}.`;
  bestMessage.textContent = !savedNewBest
    ? "Could not save your new personal best in this browser."
    : isNewBest
      ? "New personal best!"
    : `Best: ${previousBest.moves} moves in ${formatTime(previousBest.seconds)}.`;
  winPanel.hidden = false;
  updateBestScore();
}

function getBestScore(difficulty) {
  try {
    const savedScore = localStorage.getItem(`memoryGameBest:${difficulty}`);
    if (!savedScore) {
      return null;
    }

    const score = JSON.parse(savedScore);
    if (
      !Number.isInteger(score.moves) ||
      score.moves < 1 ||
      !Number.isInteger(score.seconds) ||
      score.seconds < 0
    ) {
      throw new Error("Saved best score is not valid.");
    }
    return score;
  } catch (error) {
    gameStatus.textContent = "Could not read saved best scores in this browser.";
    return null;
  }
}

function saveBestScore(difficulty, score) {
  try {
    localStorage.setItem(
      `memoryGameBest:${difficulty}`,
      JSON.stringify(score),
    );
    return true;
  } catch (error) {
    return false;
  }
}

function updateBestScore() {
  const bestScore = getBestScore(difficultySelect.value);
  bestScoreDisplay.textContent = bestScore
    ? `${bestScore.moves} · ${formatTime(bestScore.seconds)}`
    : "—";
}

function handleCardClick(event) {
  const selectedCard = event.target.closest(".memory-card");

  if (
    selectedCard === null ||
    lockBoard ||
    gameFinished ||
    selectedCard === firstCard ||
    selectedCard.classList.contains("is-matched") ||
    selectedCard.classList.contains("is-flipped")
  ) {
    return;
  }

  startTimer();
  selectedCard.classList.add("is-flipped");
  selectedCard.setAttribute("aria-pressed", "true");
  selectedCard.setAttribute("aria-label", selectedCard.dataset.label);

  if (firstCard === null) {
    firstCard = selectedCard;
    gameStatus.textContent = "Choose one more card.";
    return;
  }

  moves += 1;
  moveCount.textContent = String(moves);

  if (firstCard.dataset.value === selectedCard.dataset.value) {
    firstCard.classList.add("is-matched");
    selectedCard.classList.add("is-matched");
    firstCard.disabled = true;
    selectedCard.disabled = true;
    firstCard.setAttribute(
      "aria-label",
      `${firstCard.dataset.label}, matched`,
    );
    selectedCard.setAttribute(
      "aria-label",
      `${selectedCard.dataset.label}, matched`,
    );
    firstCard = null;
    matchedPairs += 1;

    if (matchedPairs === activePairCount) {
      finishGame();
    } else {
      gameStatus.textContent = `Match found! ${
        activePairCount - matchedPairs
      } pairs left.`;
    }

    return;
  }

  lockBoard = true;
  gameStatus.textContent = "Not a match. Take another look.";
  mismatchTimeout = window.setTimeout(function () {
    [firstCard, selectedCard].forEach(function (card) {
      card.classList.remove("is-flipped");
      card.setAttribute("aria-pressed", "false");
      card.setAttribute("aria-label", "Hidden card");
    });
    firstCard = null;
    lockBoard = false;
    mismatchTimeout = null;
    gameStatus.textContent = "Choose two cards.";
  }, 800);
}

function startGame() {
  window.clearInterval(timerInterval);
  window.clearTimeout(mismatchTimeout);
  timerInterval = null;
  mismatchTimeout = null;
  firstCard = null;
  lockBoard = false;
  matchedPairs = 0;
  moves = 0;
  secondsElapsed = 0;
  gameFinished = false;
  moveCount.textContent = "0";
  updateTimer();
  updateBestScore();
  gameStatus.textContent = "Choose any card to begin.";
  winPanel.hidden = true;

  const difficulty = difficulties[difficultySelect.value];
  activePairCount = difficulty.pairs;
  const selectedFaces = cardFaces.slice(0, difficulty.pairs);
  const cards = shuffle(
    selectedFaces.flatMap(function (face) {
      return [face, face];
    }),
  );

  gameBoard.style.setProperty("--columns", difficulty.columns);
  gameBoard.setAttribute("aria-label", `${cards.length} memory cards`);
  gameBoard.replaceChildren(
    ...cards.map(function (face, index) {
      return createCard(face, index);
    }),
  );
}

gameBoard.addEventListener("click", handleCardClick);
restartButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);
difficultySelect.addEventListener("change", startGame);
startGame();
