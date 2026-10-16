const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const dateInput = document.getElementById("date");
const categoryList = document.getElementById("category-list");
const chartCanvas = document.getElementById("category-chart");
const chartEmpty = document.getElementById("chart-empty");
let chart = null;

const STORAGE_KEY = "expenses";

let expenses = loadExpenses();

dateInput.valueAsDate = new Date();

function loadExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function render() {
  list.innerHTML = "";

  [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((expense) => {
      const li = document.createElement("li");
      li.textContent = `${expense.date} | ${expense.title} | ${expense.category} | ${expense.amount.toFixed(2)} `;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", `Delete ${expense.title}`);
      deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

      li.appendChild(deleteBtn);
      list.appendChild(li);
    });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalEl.textContent = `Total: ${total.toFixed(2)}`;

  renderCategoryTotals();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const expense = {
    id: Date.now(),
    title: form.title.value.trim(),
    amount: Number(form.amount.value),
    category: form.category.value,
    date: form.date.value,
  };

  expenses.push(expense);
  saveExpenses();
  render();
  form.reset();
  dateInput.valueAsDate = new Date();
});

render();

function deleteExpense(id) {
  expenses = expenses.filter((e) => e.id !== id);
  saveExpenses();
  render();
}

function getCategoryTotals() {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  return totals;
}

function renderCategoryTotals() {
  categoryList.innerHTML = "";
  const totals = getCategoryTotals();

  Object.entries(totals).forEach(([category, sum]) => {
    const li = document.createElement("li");
    li.textContent = `${category}: ${sum.toFixed(2)}`;
    categoryList.appendChild(li);
  });
}

renderChart();

function renderChart() {
  const totals = getCategoryTotals();
  const labels = Object.keys(totals);
  const values = Object.values(totals);

  if (chart) {
    chart.destroy();
    chart = null;
  }

  chartEmpty.hidden = labels.length > 0;
  chartCanvas.hidden = labels.length === 0;
  if (labels.length === 0) return;

  chart = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#79e1e7",
            "#a58bff",
            "#91e6b0",
            "#ffd479",
            "#ff9da8",
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue("--ink")
              .trim(),
          },
        },
      },
    },
  });
}
