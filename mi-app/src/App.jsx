// Importamos useState y AHORA TAMBIÉN useEffect
import { useState, useEffect } from "react";
import "./App.css";

// La URL de tu API (la que está corriendo en el puerto 5000)
const API_URL = "http://localhost:5000/api/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // --- 1. LEER (READ) ---
  // Usamos useEffect para cargar las tareas de la API cuando la app inicia
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // Ojo: MongoDB usa _id. Lo "traducimos" a "id" para React
        const formattedTasks = data.map(task => ({
            ...task,
            id: task._id 
        }));
        setTasks(formattedTasks);
      } catch (err) {
        console.error("Error cargando tareas:", err);
      }
    };

    loadTasks();
  }, []); // El array vacío [] significa que esto se ejecuta solo 1 vez

  // --- 2. AGREGAR (CREATE) ---
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (title.trim() === "" || description.trim() === "") return;

    const newTask = {
      title,
      description,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      const savedTask = await response.json();
      
      // Traducimos el _id a id y lo añadimos al estado de React
      const formattedTask = { ...savedTask, id: savedTask._id };
      setTasks([...tasks, formattedTask]);
      
      setTitle("");
      setDescription("");
      setShowForm(false);

    } catch (err) {
      console.error("Error agregando tarea:", err);
    }
  };

  // --- 3. EDITAR (UPDATE) - Marcar como completada ---
  // Esta función ahora usa la API (PATCH)
  const toggleTask = async (id, currentCompleted) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !currentCompleted }) // Enviamos el estado opuesto
        });

        const updatedTask = await response.json();

        // Actualizamos el estado local en React
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, completed: updatedTask.completed } : task
            )
        );

    } catch (err) {
        console.error("Error actualizando tarea:", err);
    }
  };

  // --- 4. ELIMINAR (DELETE) ---
  // ¡Función nueva!
  const handleDeleteTask = async (id) => {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        // Si la API tuvo éxito, eliminamos la tarea del estado de React
        setTasks(tasks.filter(task => task.id !== id));

    } catch (err) {
        console.error("Error eliminando tarea:", err);
    }
  };

  // --- CÁLCULOS (sin cambios) ---
  const total = tasks.length;
  const pendientes = tasks.filter((t) => !t.completed).length;
  const completadas = tasks.filter((t) => t.completed).length;

  // --- RENDERIZADO (JSX) ---
  // ¡Casi igual, solo añadimos el botón de eliminar!
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
        <button onClick={() => setShowForm(!showForm)} aria-expanded={showForm}>
          + Nueva Tarea
        </button>
      </section>

      {showForm && (
        <form className="new-task-form" onSubmit={handleAddTask}>
          <label htmlFor="task-title">Título de la tarea</label>
          <input
            type="text"
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Comprar leche"
          />
          <label htmlFor="task-description">Descripción de la tarea</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Por la tarde en el supermercado"
          />
          <button type="submit">Agregar</button>
        </form>
      )}

      <section className="task-list">
        <h2> Todas las tareas </h2>
        {tasks.length === 0 ? (
          <p>No hay tareas aún.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
                <input
                  type="checkbox"
                  id={task.id}
                  checked={task.completed}
                  // ¡Modificado! Le pasamos el ID y el estado actual
                  onChange={() => toggleTask(task.id, task.completed)}
                />
                <label htmlFor={task.id}>
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                </label>

                {/* --- ¡BOTÓN NUEVO! --- */}
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  aria-label={`Eliminar tarea: ${task.title}`}
                  className="delete-button" // (Puedes añadir estilos para este botón en App.css)
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer>
        
      </footer>
    </div>
  );
}