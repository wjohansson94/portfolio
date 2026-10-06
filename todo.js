const todoForm = document.querySelector("#todo-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const status = document.querySelector("#status");
const filterButtons = document.querySelectorAll("[data-filter]");
const savedTasks = localStorage.getItem("profileTasks");
let tasks = savedTasks ? JSON.parse(savedTasks) : [];
let currentFilter = "all";

tasks = tasks.map(function (task) {
  if (typeof task === "string") {
    return {
      text: task,
      completed: false,
    };
  }

  return task;
});

function saveTasks() {
  localStorage.setItem("profileTasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = tasks
    .map(function (taskData, taskIndex) {
      return { taskData, taskIndex };
    })
    .filter(function ({ taskData }) {
      if (currentFilter === "active") {
        return !taskData.completed;
      }

      if (currentFilter === "completed") {
        return taskData.completed;
      }

      return true;
    });

  visibleTasks.forEach(function ({ taskData, taskIndex }) {
    const task = document.createElement("li");
    const taskContent = document.createElement("div");
    taskContent.className = "task-content";
    const checkbox = document.createElement("input");
    const taskLabel = document.createElement("span");
    const taskActions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    taskActions.className = "task-actions";

    checkbox.type = "checkbox";
    checkbox.checked = taskData.completed;
    taskLabel.textContent = taskData.text;

    if (taskData.completed) {
      taskLabel.classList.add("completed");
    }

    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function () {
      const editForm = document.createElement("form");
      const editInput = document.createElement("input");
      const saveButton = document.createElement("button");
      const cancelButton = document.createElement("button");

      editForm.className = "edit-form";
      editInput.type = "text";
      editInput.value = taskData.text;
      editInput.setAttribute("aria-label", "Edit task");
      editInput.required = true;
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
        saveTasks();
        renderTasks();
        status.textContent = "Task updated.";
      });

      cancelButton.addEventListener("click", function () {
        renderTasks();
        status.textContent = "Edit canceled.";
      });

      editForm.append(editInput, saveButton, cancelButton);
      taskContent.replaceChildren(editForm);
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

    taskContent.append(checkbox, taskLabel);
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

todoForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskText = taskInput.value.trim();
  if (taskText === "") {
    return;
  }

  tasks.push({
    text: taskText,
    completed: false,
  });
  saveTasks();
  renderTasks();
  taskInput.value = "";
  status.textContent = "Task added.";
  taskInput.focus();
});

renderTasks();
