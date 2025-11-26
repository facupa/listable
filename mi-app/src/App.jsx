import { useState, useEffect } from "react";
import "./App.css";

// La URL de tu API
const API_URL = "http://localhost:5000/api/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Estados para nueva tarea
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Estados para editar tarea
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // --- 1. LEER (READ) ---
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      // Normalizamos _id a id para que React no se queje
      const formattedTasks = data.map(task => ({
          ...task,
          id: task._id 
      }));
      setTasks(formattedTasks);
    } catch (err) {
      console.error("Error cargando tareas:", err);
    }
  };

  // --- 2. AGREGAR (CREATE) ---
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const savedTask = await response.json();
      // Agregamos la nueva tarea a la lista (incluyendo su fecha de creación)
      setTasks([...tasks, { ...savedTask, id: savedTask._id }]);
      
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      console.error("Error agregando tarea:", err);
    }
  };

  // --- 3. ACTUALIZAR ESTADO (COMPLETADA/PENDIENTE) ---
  const toggleTask = async (id, currentCompleted) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !currentCompleted })
        });

        const updatedTask = await response.json();

        setTasks(tasks.map((task) =>
            task.id === id ? { ...task, completed: updatedTask.completed } : task
        ));
    } catch (err) {
        console.error("Error actualizando tarea:", err);
    }
  };

  // --- 4. ELIMINAR (DELETE) ---
  const handleDeleteTask = async (id) => {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
        console.error("Error eliminando tarea:", err);
    }
  };

  // --- 5. EDITAR (UPDATE TEXTOS) ---
  
  // Iniciar modo edición
  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDesc("");
  };

  // Guardar cambios en la API
  const saveEdit = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            title: editTitle, 
            description: editDesc 
        })
      });

      const updatedTask = await response.json();

      setTasks(tasks.map((task) => 
        task.id === id ? { ...task, title: updatedTask.title, description: updatedTask.description } : task
      ));

      setEditingId(null); // Salir del modo edición
    } catch (err) {
      console.error("Error al guardar la edición:", err);
    }
  };

  // --- HELPER: Formatear Fecha ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  // --- CÁLCULOS ---
  const total = tasks.length;
  const pendientes = tasks.filter((t) => !t.completed).length;
  const completadas = tasks.filter((t) => t.completed).length;

  return (
    <div className="app">
      <header>
        <h1>Mi Lista de Tareas</h1>
      </header>

      <section className="stats-vertical">
        <div className="stat"> Total: {total}</div>
        <div className="stat"> Pendientes: {pendientes}</div>
        <div className="stat"> Completadas: {completadas}</div>
      </section>

      <section className="form">
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cerrar formulario" : "+ Nueva Tarea"}
        </button>
      </section>

      {showForm && (
        <form className="new-task-form" onSubmit={handleAddTask}>
          <label htmlFor="task-title">Título</label>
          <input
            type="text"
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Comprar leche"
          />
          <label htmlFor="task-description">Descripción</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Marca X, 2 litros..."
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
                
                {/* LÓGICA CONDICIONAL: ¿Estamos editando ESTA tarea? */}
                {editingId === task.id ? (
                  // === VISTA DE EDICIÓN ===
                  <div className="edit-form" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Editar título"
                      style={{ padding: '0.5rem' }}
                    />
                    <textarea 
                      value={editDesc} 
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Editar descripción"
                      style={{ padding: '0.5rem', minHeight: '60px' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button 
                        onClick={() => saveEdit(task.id)} 
                        style={{ backgroundColor: '#28a745', flex: 1, color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Guardar
                      </button>
                      <button 
                        onClick={cancelEditing} 
                        style={{ backgroundColor: '#6c757d', flex: 1, color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // === VISTA NORMAL ===
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1 }}>
                      <input
                        type="checkbox"
                        id={`check-${task.id}`}
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                        style={{ marginTop: '0.3rem' }}
                      />
                      <label htmlFor={`check-${task.id}`} style={{ cursor: 'pointer', flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: '1.1rem' }}>{task.title}</strong>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#555', fontSize: '0.9rem' }}>
                          {task.description}
                        </p>
                        
                        {/* AQUI SE MUESTRA LA FECHA */}
                        {task.createdAt && (
                          <small style={{ display: 'block', color: '#888', marginTop: '4px', fontSize: '0.75rem' }}>
                            📅 {formatDate(task.createdAt)}
                          </small>
                        )}
                      </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginLeft: '0.5rem' }}>
                      <button 
                        onClick={() => startEditing(task)}
                        style={{ backgroundColor: '#ffc107', color: '#333', fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Editar
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="delete-button"
                        style={{ backgroundColor: '#dc3545', color: 'white', fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer>
        <p>Aplicación de Tareas - React + MongoDB</p>
      </footer>
    </div>
  );
}