const STORAGE_KEY = "flashcards";

const form = document.querySelector("#card-form");
const questionInput = document.querySelector("#question");
const answerInput = document.querySelector("#answer");
const counter = document.querySelector("#counter");
const cardButton = document.querySelector("#card");
const knewButton = document.querySelector("#knew");
const didntButton = document.querySelector("#didnt");

let cards = loadCards();
let index = 0;
let showingAnswer = false;

function isValidCard(card) {
    return (
        typeof card === "object" &&
        card !== null &&
        typeof card.question === "string" &&
        typeof card.answer === "string" &&
        typeof card.known === "boolean"
    );
}

function loadCards() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(parsed) ? parsed.filter(isValidCard) : [];
    } catch {
        return [];
    }
}

function saveCards() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function render() {
    const hasCards = cards.length > 0;
    cardButton.disabled = !hasCards;
    knewButton.disabled = !hasCards;
    didntButton.disabled = !hasCards;

    if (!hasCards) {
        counter.textContent = "No cards yet. Add one above.";
        cardButton.textContent = "No cards yet";
        cardButton.classList.remove("flipped");
        return;
    }

    const card = cards[index];
    const knownCount = cards.filter((c) => c.known).length;
    counter.textContent = `Card ${index + 1} of ${cards.length} · ${knownCount} known`;
    cardButton.textContent = showingAnswer ? card.answer : card.question;
    cardButton.classList.toggle("flipped", showingAnswer);
}

function nextCard() {
    index = (index +1) % cards.length;
    showingAnswer = false;
    render();
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    if (!question || !answer) return;

    cards.push({ question, answer, known: false});
    saveCards();
    index = cards.length - 1;
    showingAnswer = false;
    form.reset();
    questionInput.focus();
    render();
});

cardButton.addEventListener("click", () => {
    showingAnswer = !showingAnswer;
    render();
});

knewButton.addEventListener("click", () => {
    cards[index].known = true;
    saveCards();
    nextCard();
});

didntButton.addEventListener("click", () => {
    cards[index].known = false;
    saveCards();
    nextCard();
});

render();