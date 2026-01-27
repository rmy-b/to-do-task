const API_URL = "https://6971f17932c6bacb12c51f9b.mockapi.io/simple-todo";

const titleInput = document.getElementById("titleInput");
const priorityInput = document.getElementById("priorityInput");
const addBtn = document.getElementById("addBtn");
const tasksDiv = document.getElementById("tasks");
const filter = document.getElementById("filter");

async function fetchTasks() {
  const res = await fetch(API_URL);
  const tasks = await res.json();
  renderTasks(tasks);
}

addBtn.addEventListener("click", async () => {
  if (!titleInput.value || !priorityInput.value) return;

  const newTask = {
    title: titleInput.value,
    priority: priorityInput.value,
    status: "pending"
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
    if (filter.value === "all") return true;
    return task.status === filter.value;
  });

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

    //EDIT 
    row.querySelector(".edit-btn").addEventListener("click", () => {
      row.innerHTML = `
        <div><input type="text" value="${task.title}"></div>
        <div><input list="priorityList" value="${task.priority}"></div>
        <div>
          <select>
            <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
          </select>
        </div>
        <div class="actions-cell">
          <button class="update-btn">Update</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      //UPDATE
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

      // DELETE 
      row.querySelector(".delete-btn").addEventListener("click", async () => {
        await fetch(`${API_URL}/${task.id}`, {
          method: "DELETE"
        });
        fetchTasks();
      });
    });

    /* DELETE */
    row.querySelector(".delete-btn").addEventListener("click", async () => {
      await fetch(`${API_URL}/${task.id}`, {
        method: "DELETE"
      });
      fetchTasks();
    });

    tasksDiv.appendChild(row);
  });
}

fetchTasks();
