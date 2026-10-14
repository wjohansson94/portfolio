const STORAGE_KEY = "helpdeskData";
const STATUSES = ["Open", "In progress", "Resolved", "Closed"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const CATEGORIES = ["Hardware", "Software", "Network", "Account"];
const MAX_TITLE = 100;
const MAX_NAME = 60;
const MAX_DESCRIPTION = 1000;
const MAX_NOTE = 300;

const form = document.querySelector("#ticket-form");
const formHeading = document.querySelector("#form-heading");
const formError = document.querySelector("#form-error");
const titleInput = document.querySelector("#title");
const requesterInput = document.querySelector("#requester");
const categoryInput = document.querySelector("#category");
const priorityInput = document.querySelector("#priority");
const descriptionInput = document.querySelector("#description");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");
const searchInput = document.querySelector("#search");
const filterStatus = document.querySelector("#filter-status");
const filterPriority = document.querySelector("#filter-priority");
const filterCategory = document.querySelector("#filter-category");
const sortSelect = document.querySelector("#sort");
const clearFiltersButton = document.querySelector("#clear-filters");
const exportButton = document.querySelector("#export-button");
const loadSamplesButton = document.querySelector("#load-samples");
const removeSamplesButton = document.querySelector("#remove-samples");
const statusMessage = document.querySelector("#status");
const errorMessage = document.querySelector("#error");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const ticketList = document.querySelector("#ticket-list");
const ticketsHeading = document.querySelector("#tickets-heading");

const counters = {
  Total: document.querySelector("#count-total"),
  Open: document.querySelector("#count-open"),
  "In progress": document.querySelector("#count-in-progress"),
  Resolved: document.querySelector("#count-resolved"),
  Closed: document.querySelector("#count-closed"),
};

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

let tickets = [];
let nextId = 1;
let editingId = null;

// ---------- Storage ----------

function isText(value, maxLength) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function isDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isValidNote(note) {
  return (
    note !== null &&
    typeof note === "object" &&
    isText(note.text, MAX_NOTE) &&
    isDate(note.createdAt)
  );
}

function isValidTicket(ticket) {
  return (
    ticket !== null &&
    typeof ticket === "object" &&
    Number.isInteger(ticket.id) &&
    ticket.id > 0 &&
    isText(ticket.title, MAX_TITLE) &&
    isText(ticket.requester, MAX_NAME) &&
    isText(ticket.description, MAX_DESCRIPTION) &&
    CATEGORIES.includes(ticket.category) &&
    PRIORITIES.includes(ticket.priority) &&
    STATUSES.includes(ticket.status) &&
    isDate(ticket.createdAt) &&
    isDate(ticket.updatedAt) &&
    Array.isArray(ticket.notes) &&
    ticket.notes.every(isValidNote)
  );
}

function loadData() {
  let saved;

  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    showError("Saved tickets could not be read, so changes will not be kept.");
    return;
  }

  if (saved === null) {
    return;
  }

  try {
    const data = JSON.parse(saved);

    if (!data || !Array.isArray(data.tickets)) {
      throw new Error("Unexpected data format");
    }

    const seenIds = new Set();
    tickets = data.tickets.filter((ticket) => {
      const valid = isValidTicket(ticket) && !seenIds.has(ticket.id);
      if (valid) {
        seenIds.add(ticket.id);
      }
      return valid;
    });

    const highestId = tickets.reduce((max, ticket) => Math.max(max, ticket.id), 0);
    nextId = Math.max(Number.isInteger(data.nextId) ? data.nextId : 1, highestId + 1);

    if (tickets.length < data.tickets.length) {
      showError("Some saved tickets were invalid and were skipped.");
    }
  } catch {
    tickets = [];
    showError("Saved tickets were unreadable and have been ignored.");
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nextId, tickets }));
  } catch {
    showError("Could not save your tickets. They will be lost when you leave this page.");
  }
}

// ---------- Small helpers ----------

function ticketCode(id) {
  return `HD-${String(id).padStart(3, "0")}`;
}

function formatDate(iso) {
  return dateFormat.format(new Date(iso));
}

function announce(message) {
  statusMessage.textContent = message;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function createTime(iso) {
  const time = createElement("time", "", formatDate(iso));
  time.dateTime = iso;
  return time;
}

function findTicket(id) {
  return tickets.find((ticket) => ticket.id === id);
}

function focusTicket(id) {
  const heading = ticketList.querySelector(`[data-id="${id}"] .ticket-title`);
  (heading || ticketsHeading).focus();
}

// ---------- Filtering and sorting ----------

function getVisibleTickets() {
  const query = searchInput.value.trim().toLowerCase();

  const visible = tickets.filter((ticket) => {
    if (filterStatus.value && ticket.status !== filterStatus.value) {
      return false;
    }
    if (filterPriority.value && ticket.priority !== filterPriority.value) {
      return false;
    }
    if (filterCategory.value && ticket.category !== filterCategory.value) {
      return false;
    }
    if (!query) {
      return true;
    }

    const searchable = [
      ticketCode(ticket.id),
      ticket.title,
      ticket.description,
      ticket.requester,
      ...ticket.notes.map((note) => note.text),
    ];
    return searchable.some((text) => text.toLowerCase().includes(query));
  });

  return visible.sort((a, b) => {
    if (sortSelect.value === "priority") {
      const difference = PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority);
      if (difference !== 0) {
        return difference;
      }
    }

    const byDate = Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id;
    return sortSelect.value === "oldest" ? -byDate : byDate;
  });
}

function hasActiveFilters() {
  return Boolean(
    searchInput.value.trim() ||
      filterStatus.value ||
      filterPriority.value ||
      filterCategory.value,
  );
}

// ---------- Rendering ----------

function createNotes(ticket) {
  const section = createElement("section", "notes");
  section.append(createElement("h4", "", `Notes (${ticket.notes.length})`));

  if (ticket.notes.length > 0) {
    const list = createElement("ul", "note-list");
    ticket.notes.forEach((note) => {
      const item = createElement("li");
      item.append(createTime(note.createdAt), createElement("p", "", note.text));
      list.append(item);
    });
    section.append(list);
  }

  const noteForm = createElement("form", "note-form");
  noteForm.dataset.id = ticket.id;
  const inputId = `note-${ticket.id}`;
  const label = createElement("label", "", `Add a note to ${ticketCode(ticket.id)}`);
  label.htmlFor = inputId;
  const input = createElement("input");
  input.id = inputId;
  input.type = "text";
  input.maxLength = MAX_NOTE;
  input.autocomplete = "off";
  input.required = true;
  const button = createElement("button", "chip-button", "Add note");
  button.type = "submit";
  const row = createElement("div", "note-row");
  row.append(input, button);
  noteForm.append(label, row);
  section.append(noteForm);

  return section;
}

function createActionButton(text, action, ticket, className) {
  const button = createElement("button", className, text);
  button.type = "button";
  button.dataset.action = action;
  button.setAttribute("aria-label", `${text} ${ticketCode(ticket.id)}`);
  return button;
}

function createTicketElement(ticket) {
  const item = createElement("li", `ticket priority-${ticket.priority.toLowerCase()}`);
  item.dataset.id = ticket.id;

  const title = createElement("h3", "ticket-title", `${ticketCode(ticket.id)}: ${ticket.title}`);
  title.tabIndex = -1;

  const badges = createElement("ul", "badges");
  const badgeTexts = [
    ticket.status,
    `${ticket.priority} priority`,
    ticket.category,
  ];
  if (ticket.sample) {
    badgeTexts.push("Sample");
  }
  badgeTexts.forEach((text) => {
    const badge = createElement("li", "", text);
    if (text === ticket.status) {
      badge.classList.add("badge-status");
    }
    badges.append(badge);
  });

  const meta = createElement("p", "ticket-meta");
  meta.append(
    `Requested by ${ticket.requester} · Created `,
    createTime(ticket.createdAt),
    " · Updated ",
    createTime(ticket.updatedAt),
  );

  const actions = createElement("div", "button-row");
  const statusIndex = STATUSES.indexOf(ticket.status);
  if (statusIndex < STATUSES.length - 1) {
    actions.append(
      createActionButton(`Move to ${STATUSES[statusIndex + 1]}`, "advance", ticket, "primary-button"),
    );
  }
  if (statusIndex >= 2) {
    actions.append(createActionButton("Reopen", "reopen", ticket, "chip-button"));
  }
  actions.append(
    createActionButton("Edit", "edit", ticket, "chip-button"),
    createActionButton("Delete", "delete", ticket, "chip-button danger-button"),
  );

  item.append(
    title,
    badges,
    meta,
    createElement("p", "ticket-description", ticket.description),
    actions,
    createNotes(ticket),
  );
  return item;
}

function renderCounters() {
  counters.Total.textContent = tickets.length;
  STATUSES.forEach((status) => {
    counters[status].textContent = tickets.filter((ticket) => ticket.status === status).length;
  });
}

function renderTickets() {
  const visible = getVisibleTickets();
  ticketList.replaceChildren(...visible.map(createTicketElement));

  if (tickets.length === 0) {
    emptyState.textContent =
      "No tickets yet. Create your first ticket above, or load a few sample tickets to try the app.";
  } else if (visible.length === 0) {
    emptyState.textContent = "No tickets match your search or filters.";
  }
  emptyState.hidden = visible.length > 0;

  resultCount.textContent =
    tickets.length === 0 ? "" : `Showing ${visible.length} of ${tickets.length} tickets.`;

  const hasSamples = tickets.some((ticket) => ticket.sample);
  loadSamplesButton.disabled = hasSamples;
  removeSamplesButton.hidden = !hasSamples;
  clearFiltersButton.disabled = !hasActiveFilters();
  exportButton.disabled = tickets.length === 0;
}

function render() {
  renderCounters();
  renderTickets();
}

// ---------- Form ----------

function showFormError(message, field) {
  formError.textContent = message;
  formError.hidden = false;
  field.focus();
}

function resetForm() {
  editingId = null;
  form.reset();
  formError.hidden = true;
  formHeading.textContent = "New ticket";
  submitButton.textContent = "Create ticket";
  cancelEditButton.hidden = true;
}

function startEdit(ticket) {
  editingId = ticket.id;
  titleInput.value = ticket.title;
  requesterInput.value = ticket.requester;
  categoryInput.value = ticket.category;
  priorityInput.value = ticket.priority;
  descriptionInput.value = ticket.description;
  formError.hidden = true;
  formHeading.textContent = `Edit ${ticketCode(ticket.id)}`;
  submitButton.textContent = "Save changes";
  cancelEditButton.hidden = false;
  titleInput.focus();
  announce(`Editing ${ticketCode(ticket.id)}.`);
}

function handleFormSubmit(event) {
  event.preventDefault();
  clearError();

  const values = {
    title: titleInput.value.trim(),
    requester: requesterInput.value.trim(),
    category: categoryInput.value,
    priority: priorityInput.value,
    description: descriptionInput.value.trim(),
  };

  if (!values.title) {
    showFormError("Enter a title for the ticket.", titleInput);
    return;
  }
  if (!values.requester) {
    showFormError("Enter the requester's name.", requesterInput);
    return;
  }
  if (!values.description) {
    showFormError("Describe the problem.", descriptionInput);
    return;
  }

  const now = new Date().toISOString();
  let focusId;

  if (editingId !== null) {
    const ticket = findTicket(editingId);
    Object.assign(ticket, values, { updatedAt: now });
    focusId = ticket.id;
    announce(`Saved changes to ${ticketCode(ticket.id)}.`);
  } else {
    const ticket = {
      id: nextId,
      ...values,
      status: "Open",
      createdAt: now,
      updatedAt: now,
      notes: [],
    };
    nextId += 1;
    tickets.push(ticket);
    focusId = ticket.id;
    announce(`Created ${ticketCode(ticket.id)}.`);
  }

  resetForm();
  saveData();
  render();
  focusTicket(focusId);
}

// ---------- Ticket actions ----------

function changeStatus(ticket, newStatus) {
  ticket.status = newStatus;
  ticket.updatedAt = new Date().toISOString();
  saveData();
  render();
  focusTicket(ticket.id);
  announce(`${ticketCode(ticket.id)} is now ${newStatus}.`);
}

function deleteTicket(ticket) {
  const confirmed = window.confirm(
    `Delete ${ticketCode(ticket.id)} "${ticket.title}"? This cannot be undone.`,
  );
  if (!confirmed) {
    return;
  }

  tickets = tickets.filter((item) => item.id !== ticket.id);
  if (editingId === ticket.id) {
    resetForm();
  }
  saveData();
  render();
  ticketsHeading.focus();
  announce(`Deleted ${ticketCode(ticket.id)}.`);
}

function handleTicketClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const ticket = findTicket(Number(button.closest("li.ticket").dataset.id));
  const statusIndex = STATUSES.indexOf(ticket.status);

  if (button.dataset.action === "advance") {
    changeStatus(ticket, STATUSES[statusIndex + 1]);
  } else if (button.dataset.action === "reopen") {
    changeStatus(ticket, "Open");
  } else if (button.dataset.action === "edit") {
    startEdit(ticket);
  } else if (button.dataset.action === "delete") {
    deleteTicket(ticket);
  }
}

function handleNoteSubmit(event) {
  event.preventDefault();
  clearError();

  const noteForm = event.target;
  const input = noteForm.querySelector("input");
  const text = input.value.trim();
  if (!text) {
    announce("Write a note before adding it.");
    input.focus();
    return;
  }

  const ticket = findTicket(Number(noteForm.dataset.id));
  const now = new Date().toISOString();
  ticket.notes.push({ text, createdAt: now });
  ticket.updatedAt = now;
  saveData();
  render();
  document.querySelector(`#note-${ticket.id}`).focus();
  announce(`Added a note to ${ticketCode(ticket.id)}.`);
}

// ---------- Sample data and export ----------

function createSampleTickets() {
  const minutes = 60 * 1000;
  const ago = (amount) => new Date(Date.now() - amount * minutes).toISOString();
  const samples = [
    {
      title: "Laptop does not turn on",
      requester: "Sample user (Anna)",
      category: "Hardware",
      priority: "High",
      status: "Open",
      description:
        "The laptop shows no lights when plugged in. Charger was tested on another laptop and works.",
      createdAt: ago(60 * 3),
      notes: [],
    },
    {
      title: "Cannot connect to office Wi-Fi",
      requester: "Sample user (Erik)",
      category: "Network",
      priority: "Medium",
      status: "In progress",
      description: "Wi-Fi shows connected but there is no internet access since this morning.",
      createdAt: ago(60 * 26),
      notes: [
        { text: "Forgot the network and reconnected. Still no access, checking the DHCP lease.", createdAt: ago(60 * 24) },
      ],
    },
    {
      title: "Password reset for shared mailbox",
      requester: "Sample user (Maria)",
      category: "Account",
      priority: "Low",
      status: "Resolved",
      description: "The shared mailbox password was forgotten after the holiday.",
      createdAt: ago(60 * 72),
      notes: [{ text: "Password reset and shared with the team. Waiting for confirmation.", createdAt: ago(60 * 70) }],
    },
    {
      title: "Shared drive unavailable for the whole team",
      requester: "Sample user (Team lead)",
      category: "Network",
      priority: "Critical",
      status: "Open",
      description: "Nobody on the team can open the shared drive. Deadline work is blocked.",
      createdAt: ago(25),
      notes: [],
    },
  ];

  return samples.map((sample) => {
    const ticket = {
      id: nextId,
      ...sample,
      updatedAt: sample.notes.length > 0 ? sample.notes[sample.notes.length - 1].createdAt : sample.createdAt,
      sample: true,
    };
    nextId += 1;
    return ticket;
  });
}

function loadSamples() {
  clearError();
  tickets.push(...createSampleTickets());
  saveData();
  render();
  announce("Loaded 4 sample tickets. They are labelled Sample and can be removed.");
}

function removeSamples() {
  tickets = tickets.filter((ticket) => !ticket.sample);
  if (editingId !== null && !findTicket(editingId)) {
    resetForm();
  }
  saveData();
  render();
  ticketsHeading.focus();
  announce("Removed the sample tickets.");
}

function exportTickets() {
  clearError();
  const json = JSON.stringify({ exportedAt: new Date().toISOString(), tickets }, null, 2);
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "helpdesk-tickets.json";
  link.click();
  URL.revokeObjectURL(url);
  announce(`Exported ${tickets.length} tickets to helpdesk-tickets.json.`);
}

function clearFilters() {
  searchInput.value = "";
  filterStatus.value = "";
  filterPriority.value = "";
  filterCategory.value = "";
  renderTickets();
  searchInput.focus();
  announce("Filters cleared.");
}

// ---------- Start ----------

form.addEventListener("submit", handleFormSubmit);
cancelEditButton.addEventListener("click", () => {
  const id = editingId;
  resetForm();
  focusTicket(id);
  announce("Editing cancelled.");
});
ticketList.addEventListener("click", handleTicketClick);
ticketList.addEventListener("submit", handleNoteSubmit);
[searchInput, filterStatus, filterPriority, filterCategory, sortSelect].forEach((control) => {
  control.addEventListener("input", renderTickets);
});
clearFiltersButton.addEventListener("click", clearFilters);
exportButton.addEventListener("click", exportTickets);
loadSamplesButton.addEventListener("click", loadSamples);
removeSamplesButton.addEventListener("click", removeSamples);

loadData();
render();
