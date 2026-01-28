const API_URL = "https://6971f17932c6bacb12c51f9b.mockapi.io/simple-todo";

const titleInput = document.getElementById("titleInput");
const priorityInput = document.getElementById("priorityInput");
const addBtn = document.getElementById("addBtn");
const tasksDiv = document.getElementById("tasks");
const filter = document.getElementById("filter");

const modal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const stateMessage = document.getElementById("stateMessage");

let deleteTaskId = null;

async function fetchTasks() {
  tasksDiv.innerHTML = "";
  stateMessage.textContent = "Loading tasks...";

  const res = await fetch(API_URL);
  const tasks = await res.json();

  renderTasks(tasks);
}


addBtn.addEventListener("click", async () => {
  if (!titleInput.value || !priorityInput.value) return;

  const newTask = {
    title: titleInput.value,
    priority: priorityInput.value,
    status: "Pending"
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask)
  });

  resetInputRow();
  fetchTasks();
});

filter.addEventListener("change", fetchTasks);

function resetInputRow() {
  titleInput.value = "";
  priorityInput.value = "";
}


function renderTasks(tasks) {
  tasksDiv.innerHTML = "";

  const filtered = tasks.filter(task => {
    if (filter.value === "All") return true;
    return task.status === filter.value;
  });

  if (filtered.length === 0) {
    stateMessage.textContent = "No tasks found";
    return;
  }

  stateMessage.textContent = "";

  filtered.forEach(task => {
    const row = document.createElement("div");
    row.className = "table-row task";

    row.innerHTML = `
      <div>${task.title}</div>
      <div>${task.priority}</div>
      <div>${task.status}</div>
      <div class="actions-cell">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    // EDIT 
    row.querySelector(".edit-btn").addEventListener("click", () => {
      row.innerHTML = `
        <div><input type="text" value="${task.title}"></div>
        <div><input list="priorityList" value="${task.priority}"></div>
        <div>
          <select>
            <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
          </select>
        </div>
        <div class="actions-cell">
          <button class="update-btn">Update</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      // UPDATE
      row.querySelector(".update-btn").addEventListener("click", async () => {
        const updatedTask = {
          title: row.querySelector("input[type=text]").value,
          priority: row.querySelector("input[list]").value,
          status: row.querySelector("select").value
        };

        await fetch(`${API_URL}/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask)
        });

        fetchTasks();
      });

    
      row.querySelector(".delete-btn").addEventListener("click", () => {
        openDeleteModal(task.id);
      });
    });

    // DELETE
    row.querySelector(".delete-btn").addEventListener("click", () => {
      openDeleteModal(task.id);
    });

    tasksDiv.appendChild(row);
  });
}


function openDeleteModal(taskId) {
  deleteTaskId = taskId;
  modal.classList.remove("hidden");
}


cancelDeleteBtn.addEventListener("click", () => {
  deleteTaskId = null;
  modal.classList.add("hidden");
});

// CONFIRM DELETE
confirmDeleteBtn.addEventListener("click", async () => {
  if (!deleteTaskId) return;

  await fetch(`${API_URL}/${deleteTaskId}`, {
    method: "DELETE"
  });

  deleteTaskId = null;
  modal.classList.add("hidden");
  fetchTasks();
});

fetchTasks();

