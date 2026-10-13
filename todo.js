const todoForm = document.querySelector("#todo-form");
const taskInput = document.querySelector("#task-input");
const dueDateInput = document.querySelector("#task-due-date");
const searchInput = document.querySelector("#task-search");
const sortInput = document.querySelector("#task-sort");
const taskList = document.querySelector("#task-list");
const taskSummary = document.querySelector("#task-summary");
const status = document.querySelector("#status");
const emptyState = document.querySelector("#empty-state");
const filterButtons = document.querySelectorAll("[data-filter]");
const savedTasks = localStorage.getItem("profileTasks");
let tasks = savedTasks ? JSON.parse(savedTasks) : [];
let currentFilter = "all";
let currentSearch = "";
let currentSort = "added";

tasks = tasks.map(function (task) {
  if (typeof task === "string") {
    return {
      text: task,
      completed: false,
      dueDate: "",
    };
  }

  return {
    ...task,
    dueDate: task.dueDate || "",
  };
});

function saveTasks() {
  localStorage.setItem("profileTasks", JSON.stringify(tasks));
}

function formatDueDate(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderTasks() {
  taskList.innerHTML = "";

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(function (task) {
    return task.completed;
  }).length;
  const activeTasks = totalTasks - completedTasks;

  taskSummary.textContent =
    `${totalTasks} total · ${activeTasks} active · ${completedTasks} completed`;

  const visibleTasks = tasks
    .map(function (taskData, taskIndex) {
      return { taskData, taskIndex };
    })
    .filter(function ({ taskData }) {
      const matchesStatus =
        currentFilter === "all" ||
        (currentFilter === "active" && !taskData.completed) ||
        (currentFilter === "completed" && taskData.completed);

      const matchesSearch = taskData.text.toLowerCase().includes(currentSearch);

      return matchesStatus && matchesSearch;
    })
    .sort(function (left, right) {
      if (currentSort === "name") {
        return (
          left.taskData.text.localeCompare(right.taskData.text) ||
          left.taskIndex - right.taskIndex
        );
      }

      if (currentSort === "due-date") {
        const leftDate = left.taskData.dueDate;
        const rightDate = right.taskData.dueDate;

        if (!leftDate && rightDate) {
          return 1;
        }

        if (leftDate && !rightDate) {
          return -1;
        }

        return (
          leftDate.localeCompare(rightDate) ||
          left.taskIndex - right.taskIndex
        );
      }

      return left.taskIndex - right.taskIndex;
    });

  emptyState.hidden = visibleTasks.length > 0;
  if (tasks.length === 0) {
    emptyState.textContent = "No tasks yet. Add a task above to get started.";
  } else if (
    visibleTasks.length === 0 &&
    currentSearch &&
    currentFilter !== "all"
  ) {
    emptyState.textContent = "No tasks match your search and filter.";
  } else if (visibleTasks.length === 0 && currentSearch) {
    emptyState.textContent = "No tasks match your search.";
  } else if (visibleTasks.length === 0 && currentFilter === "active") {
    emptyState.textContent = "No active tasks.";
  } else if (visibleTasks.length === 0 && currentFilter === "completed") {
    emptyState.textContent = "No completed tasks.";
  }

  visibleTasks.forEach(function ({ taskData, taskIndex }) {
    const task = document.createElement("li");
    const taskContent = document.createElement("div");
    taskContent.className = "task-content";
    const checkbox = document.createElement("input");
    const taskDetails = document.createElement("div");
    const taskLabel = document.createElement("span");
    const dueDateLabel = document.createElement("span");
    const taskActions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    taskActions.className = "task-actions";
    taskDetails.className = "task-details";

    checkbox.type = "checkbox";
    checkbox.checked = taskData.completed;
    taskLabel.textContent = taskData.text;
    dueDateLabel.className = "task-due-date";

    if (taskData.completed) {
      taskLabel.classList.add("completed");
    }

    if (taskData.dueDate) {
      const isOverdue =
        !taskData.completed && taskData.dueDate < getTodayDate();
      dueDateLabel.textContent = `Due ${formatDueDate(taskData.dueDate)}${
        isOverdue ? " · Overdue" : ""
      }`;

      if (isOverdue) {
        dueDateLabel.classList.add("overdue");
      }
    }

    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function () {
      const editForm = document.createElement("form");
      const editInput = document.createElement("input");
      const editDueDateInput = document.createElement("input");
      const saveButton = document.createElement("button");
      const cancelButton = document.createElement("button");

      editForm.className = "edit-form";
      editInput.type = "text";
      editInput.value = taskData.text;
      editInput.setAttribute("aria-label", "Edit task");
      editInput.required = true;
      editDueDateInput.type = "date";
      editDueDateInput.value = taskData.dueDate;
      editDueDateInput.setAttribute("aria-label", "Edit due date (optional)");
      saveButton.type = "submit";
      saveButton.textContent = "Save";
      cancelButton.type = "button";
      cancelButton.textContent = "Cancel";

      editForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const updatedText = editInput.value.trim();
        if (updatedText === "") {
          editInput.focus();
          return;
        }

        taskData.text = updatedText;
        taskData.dueDate = editDueDateInput.value;
        saveTasks();
        renderTasks();
        status.textContent = "Task updated.";
      });

      cancelButton.addEventListener("click", function () {
        renderTasks();
        status.textContent = "Edit canceled.";
      });

      editForm.append(
        editInput,
        editDueDateInput,
        saveButton,
        cancelButton,
      );
      taskDetails.replaceChildren(editForm);
      editInput.focus();
    });

    checkbox.addEventListener("change", function () {
      taskData.completed = checkbox.checked;
      saveTasks();
      renderTasks();
      status.textContent = checkbox.checked
        ? "Task completed."
        : "Task marked incomplete.";
    });

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      tasks.splice(taskIndex, 1);
      saveTasks();
      renderTasks();
      status.textContent = "Task deleted.";
    });

    taskDetails.append(taskLabel);
    if (taskData.dueDate) {
      taskDetails.append(dueDateLabel);
    }
    taskContent.append(checkbox, taskDetails);
    taskActions.append(editButton, deleteButton);
    task.append(taskContent, taskActions);
    taskList.append(task);
  });
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(function (filterButton) {
      filterButton.setAttribute(
        "aria-pressed",
        filterButton === button ? "true" : "false",
      );
    });
    renderTasks();
  });
});

searchInput.addEventListener("input", function () {
  currentSearch = searchInput.value.trim().toLowerCase();
  renderTasks();
});

sortInput.addEventListener("change", function () {
  currentSort = sortInput.value;
  renderTasks();
});

todoForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskText = taskInput.value.trim();
  if (taskText === "") {
    return;
  }

  tasks.push({
    text: taskText,
    completed: false,
    dueDate: dueDateInput.value,
  });
  saveTasks();
  renderTasks();
  taskInput.value = "";
  dueDateInput.value = "";
  status.textContent = "Task added.";
  taskInput.focus();
});

renderTasks();
