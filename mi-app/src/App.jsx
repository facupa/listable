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

  // 1. Convertí la sección del formulario en un <form> real
  // y creé esta función para manejar el 'submit'
  const handleAddTask = (e) => {
    e.preventDefault(); // Previene que la página se recargue
    if (title.trim() === "" || description.trim() === "") return;
    
    const task = {
      id: Date.now().toString(), // Usar un string para el ID es más robusto
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
        {/* 2. MEJORA DE ACCESIBILIDAD:
          Agregamos 'aria-expanded' para que el lector de pantalla
          sepa si el formulario está abierto o cerrado.
        */}
        <button onClick={() => setShowForm(!showForm)} aria-expanded={showForm}>
          + Nueva Tarea
        </button>
      </section>

      {showForm && (
        /* 3. MEJORA DE ACCESIBILIDAD:
          Usamos <form> en lugar de <section> y vinculamos
          los <label> con los <input> y <textarea>.
        */
        <form className="new-task-form" onSubmit={handleAddTask}>
          
          {/* Etiqueta para el título */}
          <label htmlFor="task-title">Título de la tarea</label>
          <input
            type="text"
            id="task-title" // ID para conectar con el label
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Comprar leche"
          />

          {/* Etiqueta para la descripción */}
          <label htmlFor="task-description">Descripción de la tarea</label>
          <textarea
            id="task-description" // ID para conectar con el label
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Por la tarde en el supermercado"
          />
          <button type="submit">Agregar</button>
        </form>
      )}

      <section className="task-list">
        {tasks.length === 0 ? (
          <p>No hay tareas aún.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
                
                {/* --- 4. LA CORRECCIÓN PRINCIPAL --- */}

                {/* Paso A: Agregamos un 'id' único al input */}
                <input
                  type="checkbox"
                  id={task.id}
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />

                {/* Paso B: Cambiamos el <div> por un <label>
                  y usamos 'htmlFor' para conectarlo al 'id' del input
                */}
                <label htmlFor={task.id}>
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                </label>

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