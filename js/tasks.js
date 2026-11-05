let currentFilter = "pending";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("task-list").addEventListener("click", onListClick);
  loadTasks();
});

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function prepareTask() {
  const titleInput = document.getElementById("task-input");
  const title = titleInput.value.trim();
  if (!title) { alert("Escribe el título de la tarea"); return; }

  const session = getSession();
  const data = db.read();
  data.tasks.push({
    id: uid(),
    user_id: session.id,
    title,
    priority: document.getElementById("task-priority").value,
    due_date: document.getElementById("task-date").value || null,
    is_completed: false,
    created_at: new Date().toISOString()
  });
  db.write(data);

  titleInput.value = "";
  document.getElementById("task-date").value = "";
  loadTasks();
}

function loadTasks() {
  const session = getSession();
  let tasks = db.read().tasks.filter(t => t.user_id === session.id);

  if (currentFilter === "pending") tasks = tasks.filter(t => !t.is_completed);
  else if (currentFilter === "completed") tasks = tasks.filter(t => t.is_completed);
  else if (currentFilter === "urgent") tasks = tasks.filter(t => t.priority === "urgent" && !t.is_completed);

  tasks.sort((a, b) => b.created_at.localeCompare(a.created_at));
  renderTasks(tasks);
}

function renderTasks(tasks) {
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.priority === "urgent" && !task.is_completed) li.classList.add("priority-urgent");

    // due_date viene como YYYY-MM-DD; se parsea local para evitar el desfase de zona horaria
    const dateDisplay = task.due_date
      ? `<small class="task-date">📅 ${new Date(task.due_date + "T00:00:00").toLocaleDateString()}</small>`
      : "";

    li.innerHTML = `
      <div class="task-content">
        <input type="checkbox" data-action="toggle" ${task.is_completed ? "checked" : ""}>
        <span class="${task.is_completed ? "completed-text" : ""}">${esc(task.title)}</span>
        ${dateDisplay}
      </div>
      <button data-action="delete" class="btn-delete">X</button>`;
    list.appendChild(li);
  });
}

function onListClick(e) {
  const action = e.target.dataset.action;
  if (!action) return;
  const id = e.target.closest("li").dataset.id;
  const data = db.read();

  if (action === "toggle") {
    const t = data.tasks.find(t => t.id === id);
    if (t) t.is_completed = !t.is_completed;
  } else if (action === "delete") {
    if (!confirm("¿Seguro que quieres eliminar esta tarea?")) return;
    data.tasks = data.tasks.filter(t => t.id !== id);
  }
  db.write(data);
  loadTasks();
}

function filterTasks(filterType) {
  currentFilter = filterType;
  document.querySelectorAll(".tab").forEach(tab =>
    tab.classList.toggle("active", tab.getAttribute("onclick").includes(`'${filterType}'`)));
  loadTasks();
}

// ---- JSON: respaldo y portabilidad ----
function exportTasks() {
  const session = getSession();
  const mine = db.read().tasks.filter(t => t.user_id === session.id);
  const blob = new Blob([JSON.stringify(mine, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tareas.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importTasks(input) {
  const file = input.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported)) throw new Error("formato");
    const session = getSession();
    const data = db.read();
    const known = new Set(data.tasks.map(t => t.id));
    imported.forEach(t => {
      if (!t.title || known.has(t.id)) return;
      data.tasks.push({
        id: t.id || uid(),
        user_id: session.id,
        title: String(t.title),
        priority: t.priority === "urgent" ? "urgent" : "normal",
        due_date: t.due_date || null,
        is_completed: !!t.is_completed,
        created_at: t.created_at || new Date().toISOString()
      });
    });
    db.write(data);
    loadTasks();
  } catch {
    alert("Archivo JSON inválido");
  }
  input.value = "";
}
