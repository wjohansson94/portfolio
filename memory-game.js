const cardFaces = [
  { value: "rocket", symbol: "🚀", label: "Rocket" },
  { value: "headphones", symbol: "🎧", label: "Headphones" },
  { value: "game", symbol: "🎮", label: "Game controller" },
  { value: "computer", symbol: "💻", label: "Laptop" },
  { value: "puzzle", symbol: "🧩", label: "Puzzle piece" },
  { value: "art", symbol: "🎨", label: "Palette" },
  { value: "battery", symbol: "🔋", label: "Battery" },
  { value: "moon", symbol: "🌙", label: "Crescent moon" },
];

const gameBoard = document.querySelector("#game-board");
const moveCount = document.querySelector("#move-count");
const timerDisplay = document.querySelector("#timer");
const gameStatus = document.querySelector("#game-status");
const restartButton = document.querySelector("#restart-button");

let firstCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let secondsElapsed = 0;
let timerInterval = null;
let mismatchTimeout = null;

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
  gameStatus.textContent =
    `You found all eight pairs in ${moves} moves and ${formatTime(secondsElapsed)}. Nice work!`;
}

function handleCardClick(event) {
  const selectedCard = event.target.closest(".memory-card");

  if (
    selectedCard === null ||
    lockBoard ||
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

    if (matchedPairs === cardFaces.length) {
      finishGame();
    } else {
      gameStatus.textContent = `Match found! ${cardFaces.length - matchedPairs} pairs left.`;
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
  moveCount.textContent = "0";
  updateTimer();
  gameStatus.textContent = "Choose any card to begin.";

  const cards = shuffle(
    cardFaces.flatMap(function (face) {
      return [face, face];
    }),
  );

  gameBoard.replaceChildren(
    ...cards.map(function (face, index) {
      return createCard(face, index);
    }),
  );
}

gameBoard.addEventListener("click", handleCardClick);
restartButton.addEventListener("click", startGame);
startGame();
