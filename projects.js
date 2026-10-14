const more = document.getElementById("more-projects");

if (more) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "projects-toggle";
  button.setAttribute("aria-controls", "more-projects");
  button.setAttribute("aria-expanded", "false");
  const count = more.querySelectorAll("article").length;
  button.textContent = `Show all projects (${count} more)`;
  more.hidden = true;
  more.after(button);

  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    more.hidden = open;
    button.setAttribute("aria-expanded", String(!open));
    button.textContent = open ? `Show all projects (${count} more)` : "Show fewer projects";
  });
}
