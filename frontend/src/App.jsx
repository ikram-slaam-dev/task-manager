
import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Could not load tasks");
      setTasks(await response.json());
      setError("");
    } catch {
      setError("Unable to load tasks. Check the backend and database.");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });

      if (!response.ok) throw new Error("Could not save task");

      setTitle("");
      await loadTasks();
    } catch {
      setError("Unable to save task.");
    }
  }

  return (
    <main style={{
      maxWidth: 600,
      margin: "50px auto",
      padding: 20,
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>Task Manager</h1>
      <p>Tasks are stored in Amazon RDS MySQL.</p>

      <form onSubmit={addTask}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter a task"
          aria-label="Task title"
          required
        />
        <button type="submit">Add Task</button>
      </form>

      {error && <p role="alert">{error}</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </main>
  );
}

export default App;
