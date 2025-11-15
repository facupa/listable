 import { useState } from "react";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const total = tasks.length;
  const pendientes = tasks.filter((t) => !t.completed).length;
  const completadas = tasks.filter((t) => t.completed).length;

  const addTask = () => {
    if (title.trim() === "" || description.trim() === "") return;
    const task = {
      id: Date.now(),
      title,
      description,
      completed: false,
    };
    setTasks([...tasks, task]);
    setTitle("");
    setDescription("");
    setShowForm(false); // cerrar formulario después de agregar
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="app">
      <header>
        <h1>Mi Lista de Tareas</h1>
      </header>

      <section className="stats-vertical">
        <div className="stat"> Total de Tareas: {total}</div>
        <div className="stat"> Pendientes: {pendientes}</div>
        <div className="stat"> Completadas: {completadas}</div>
      </section>

      <section className="form">
        <button onClick={() => setShowForm(!showForm)}>
          + Nueva Tarea
        </button>
      </section>

      {showForm && (
        <section className="new-task-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la tarea"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción de la tarea"
          />
          <button onClick={addTask}>Agregar</button>
        </section>
      )}

      <section className="task-list">
        {tasks.length === 0 ? (
          <p>No hay tareas aún.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer>
        <p>Todas las tareas</p>
      </footer>
    </div>
  );
}

