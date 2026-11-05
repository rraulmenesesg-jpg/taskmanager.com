// Variable global para controlar qué estamos viendo (Pendientes por defecto)
let currentFilter = 'pending';

// 1. INICIALIZACIÓN (Se ejecuta cuando carga la página)
document.addEventListener('DOMContentLoaded', () => {
  // Escuchar el clic del botón de agregar
  const addBtn = document.getElementById('add-task-btn');
  if (addBtn) {
    addBtn.addEventListener('click', prepareTask);
  }

  // Carga inicial de datos
  loadTasks();
});

// 2. CAPTURA DE DATOS DEL FORMULARIO
function prepareTask() {
  const titleInput = document.getElementById('task-input');
  const priorityInput = document.getElementById('task-priority');
  const dateInput = document.getElementById('task-date');

  const title = titleInput.value.trim();
  const priority = priorityInput.value;
  const dueDate = dateInput.value;

  if (title === "") {
    alert("Por favor, escribe el título de la tarea");
    return;
  }

  addTask(title, priority, dueDate);

  // Limpiar el formulario
  titleInput.value = "";
  dateInput.value = "";
}

// 3. INSERTAR EN SUPABASE
async function addTask(title, priority, dueDate) {
  const { data: { user } } = await window.supabaseClient.auth.getUser();

  if (!user) {
    alert("Sesión no válida");
    return;
  }

  const { error } = await window.supabaseClient.from("tasks").insert({
    title: title,
    user_id: user.id,
    priority: priority,
    due_date: dueDate || null,
    is_completed: false
  });

  if (error) {
    alert("Error al guardar: " + error.message);
  } else {
    loadTasks();
  }
}

// 4. CARGAR Y FILTRAR TAREAS
async function loadTasks() {
  // Iniciamos la consulta base
  let query = window.supabaseClient.from("tasks").select("*");

  // Aplicamos filtros según la pestaña activa
  if (currentFilter === 'pending') {
    query = query.eq('is_completed', false);
  } else if (currentFilter === 'completed') {
    query = query.eq('is_completed', true);
  } else if (currentFilter === 'urgent') {
    query = query.eq('priority', 'urgent').eq('is_completed', false);
  }

  // Ordenamos por fecha de creación (más nuevas primero)
  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando tareas:", error.message);
    return;
  }

  renderTasks(data);
}

// 5. RENDERIZAR (DIBUJAR) EN EL HTML
function renderTasks(tasks) {
  const list = document.getElementById("task-list");
  if (!list) return;
  
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    
    // Si es urgente, añadimos una clase para el estilo CSS
    if (task.priority === 'urgent' && !task.is_completed) {
      li.classList.add('priority-urgent');
    }

    // Formatear la fecha para que se vea bonita
    const dateDisplay = task.due_date 
      ? `<small class="task-date">📅 ${new Date(task.due_date).toLocaleDateString()}</small>` 
      : "";

    li.innerHTML = `
      <div class="task-content">
        <input type="checkbox" ${task.is_completed ? 'checked' : ''} 
          onclick="toggleTask('${task.id}', ${task.is_completed})">
        <span class="${task.is_completed ? 'completed-text' : ''}">${task.title}</span>
        ${dateDisplay}
      </div>
      <button onclick="deleteTask('${task.id}')" class="btn-delete">X</button>
    `;

    list.appendChild(li);
  });
}

// 6. CAMBIAR ESTADO (COMPLETADO / PENDIENTE)
async function toggleTask(id, currentState) {
  const { error } = await window.supabaseClient
    .from("tasks")
    .update({ is_completed: !currentState })
    .eq("id", id);

  if (error) {
    alert("Error al actualizar: " + error.message);
  } else {
    loadTasks();
  }
}

// 7. FUNCIÓN PARA LAS PESTAÑAS (FILTROS)
function filterTasks(filterType) {
  currentFilter = filterType;
  
  // Actualizar visualmente las pestañas
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
    // Si el texto del botón coincide con el filtro, activarlo
    if (tab.innerText.toLowerCase().includes(filterType)) {
      tab.classList.add('active');
    }
  });
  
  loadTasks();
}

// 8. BORRAR TAREA
async function deleteTask(id) {
  const confirmacion = confirm("¿Seguro que quieres eliminar esta tarea?");
  if (!confirmacion) return;

  const { error } = await window.supabaseClient.from("tasks").delete().eq("id", id);
  
  if (error) {
    alert("Error al borrar: " + error.message);
  } else {
    loadTasks();
  }
}