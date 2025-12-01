import { useState, useEffect, useRef } from "react";
import Login from "./Login";
import Register from "./Register";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

export default function App() {
  // --- ESTADOS DE AUTENTICACIÓN ---
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);

  // --- ESTADOS DE LA APP ---
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); 
  
  // Estados para formularios
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Estados de edición
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // 🔍 Referencia para gestionar la devolución del foco al terminar de editar
  const prevEditingIdRef = useRef(null);

  useEffect(() => {
    if (token) loadTasks();
  }, [token]);

  // 🔍 EFECTO PARA GESTIÓN DEL FOCO (WCAG 2.4.3)
  // Cuando editingId pasa de tener un valor a null (se cierra la edición),
  // buscamos el botón "Editar" de esa tarea y le devolvemos el foco.
  useEffect(() => {
    if (prevEditingIdRef.current !== null && editingId === null) {
      const editButton = document.getElementById(`btn-edit-${prevEditingIdRef.current}`);
      if (editButton) {
        editButton.focus();
      }
    }
    // Guardamos el ID actual para la próxima comparación
    prevEditingIdRef.current = editingId;
  }, [editingId]);

  // --- FUNCIONES DE AUTENTICACIÓN ---
  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setStatusMessage("Sesión iniciada correctamente.");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
    setStatusMessage("Sesión cerrada.");
  };

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  // --- FUNCIONES CRUD ---
  const loadTasks = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        const formattedTasks = data.map(task => ({ ...task, id: task._id }));
        setTasks(formattedTasks);
      } else if (response.status === 401 || response.status === 403) {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("Error de conexión al cargar tareas.");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    // 🔍 Validación visual y semántica (WCAG 3.3.1)
    if (!title.trim()) {
      setStatusMessage("Error: El título de la tarea es obligatorio.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, description }),
      });
      if (response.ok) {
        const savedTask = await response.json();
        setTasks([...tasks, { ...savedTask, id: savedTask._id }]);
        setStatusMessage(`Tarea "${savedTask.title}" agregada.`);
        setTitle(""); setDescription(""); setShowForm(false);
      }
    } catch (err) { console.error(err); }
  };

  const toggleTask = async (id, currentCompleted) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: !currentCompleted })
      });
      if (response.ok) {
        const updated = await response.json();
        
        setTasks(tasks.map(t => t.id === id ? { 
          ...t, 
          completed: updated.completed, 
          updatedAt: updated.updatedAt 
        } : t));
        
        setStatusMessage(`Tarea marcada como ${updated.completed ? 'completada' : 'pendiente'}.`);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    // Confirmación nativa accesible (simple pero efectiva)
    if (!window.confirm(`¿Estás seguro de eliminar la tarea "${taskToDelete?.title}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id));
        setStatusMessage(`Tarea "${taskToDelete?.title}" eliminada.`);
      }
    } catch (err) { console.error(err); }
  };

  // --- LÓGICA DE EDICIÓN ---
  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setStatusMessage(""); // Limpiar mensajes previos
  };

  const cancelEditing = () => {
    setEditingId(null);
    setStatusMessage("Edición cancelada.");
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) {
      setStatusMessage("Error: El título no puede estar vacío.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: editTitle, description: editDesc })
      });
      if (response.ok) {
        const updated = await response.json();
        
        setTasks(tasks.map(t => t.id === id ? { 
          ...t, 
          title: updated.title, 
          description: updated.description, 
          updatedAt: updated.updatedAt 
        } : t));
        
        setEditingId(null);
        setStatusMessage("Tarea actualizada correctamente.");
      }
    } catch (err) { console.error(err); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : "";

  // --- RENDERIZADO ---
  if (!token) {
    return showRegister 
      ? <Register onSwitchToLogin={() => setShowRegister(false)} />
      : <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
  }

  const total = tasks.length;
  const pendientes = tasks.filter(t => !t.completed).length;
  const completadas = tasks.filter(t => t.completed).length;

  return (
    <div className="app">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Mis Tareas</h1>
        <button 
          onClick={handleLogout} 
          style={{ width: 'auto', background: '#dc3545', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          aria-label="Cerrar sesión actual"
        >
          Salir
        </button>
      </header>

      {/* Región de notificaciones (status) única */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {/* Estadísticas sin aria-live para evitar ruido excesivo */}
      <section 
        className="stats-vertical" 
        aria-labelledby="stats-heading"
      >
        <h2 id="stats-heading" className="sr-only">Estadísticas de progreso</h2>
        <ul className="stats-list">
          <li className="stat-item">
            <span aria-hidden="true" style={{ marginRight: '5px' }}>📋</span> 
            <span>Total: <strong>{total}</strong></span>
          </li>
          <li className="stat-item">
            <span aria-hidden="true" style={{ marginRight: '5px' }}>⏳</span>
            <span>Pendientes: <strong>{pendientes}</strong></span>
          </li>
          <li className="stat-item">
            <span aria-hidden="true" style={{ marginRight: '5px' }}>✅</span>
            <span>Completadas: <strong>{completadas}</strong></span>
          </li>
        </ul>
      </section>

      {/* 🔍 BOTÓN NUEVA TAREA: Verificación de aria-expanded */}
      <section className="form" aria-labelledby="form-heading">
        <h2 id="form-heading" className="sr-only">Administrar tareas</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          /* WCAG 4.1.2: aria-expanded indica si el panel colapsable está abierto o cerrado.
             El valor cambia dinámicamente (true/false) con el estado showForm.
          */
          aria-expanded={showForm} 
          aria-controls="add-task-form"
        >
          {showForm ? "Cerrar formulario" : "+ Nueva Tarea"}
        </button>
      </section>

      {showForm && (
        <form id="add-task-form" className="new-task-form" onSubmit={handleAddTask}>
          <label htmlFor="t-title">Título</label>
          <input 
            id="t-title" 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Ej: Comprar pan"
            /* WCAG 2.4.3: Al abrir, el foco viaja aquí automáticamente */
            autoFocus 
          />
          <label htmlFor="t-desc">Descripción</label>
          <textarea 
            id="t-desc" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Detalles..."
          />
          <button type="submit">Agregar</button>
        </form>
      )}

      <section className="task-list" aria-labelledby="list-heading">
        <h2 id="list-heading">Lista de Tareas</h2>
        
        {tasks.length === 0 ? <p>No tienes tareas guardadas.</p> : (
          <ul>
            {tasks.map(task => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
                
                {editingId === task.id ? (
                  // --- FORMULARIO DE EDICIÓN EN LÍNEA ---
                  <form 
                    className="edit-form" 
                    onSubmit={(e) => { e.preventDefault(); saveEdit(task.id); }} 
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  >
                    <label htmlFor={`et-${task.id}`} className="sr-only">Editar título</label>
                    <input 
                      id={`et-${task.id}`} 
                      type="text" 
                      value={editTitle} 
                      onChange={e => setEditTitle(e.target.value)} 
                      autoFocus 
                      style={{ padding: '0.5rem' }} 
                    />
                    <label htmlFor={`ed-${task.id}`} className="sr-only">Editar descripción</label>
                    <textarea 
                      id={`ed-${task.id}`} 
                      value={editDesc} 
                      onChange={e => setEditDesc(e.target.value)} 
                      style={{ padding: '0.5rem' }} 
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" style={{ backgroundColor: '#28a745', flex: 1, color: 'white' }}>Guardar</button>
                      <button type="button" onClick={cancelEditing} style={{ backgroundColor: '#6c757d', flex: 1, color: 'white' }}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  // --- VISTA DE TAREA ---
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1 }}>
                      <input 
                        type="checkbox" 
                        id={`chk-${task.id}`}
                        checked={task.completed} 
                        onChange={() => toggleTask(task.id, task.completed)} 
                        style={{ marginTop: '0.3rem' }} 
                        aria-label={`Marcar ${task.title} como ${task.completed ? 'pendiente' : 'completada'}`} 
                      />
                      <label htmlFor={`chk-${task.id}`} style={{ cursor: 'pointer', flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: '1.1rem' }}>{task.title}</strong>
                        <p style={{ margin: '0.2rem 0', color: '#555', fontSize: '0.9rem' }}>{task.description}</p>
                        
                        <small style={{ color: '#888', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                          📅 Creado: {formatDate(task.createdAt)}
                          {task.updatedAt && task.createdAt !== task.updatedAt && (
                            <span style={{ marginLeft: '10px', color: '#007bff', fontWeight: 'bold' }}>
                              📝 Actualizado: {formatDate(task.updatedAt)}
                            </span>
                          )}
                        </small>
                      </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginLeft: '0.5rem' }}>
                      {/* 🔍 BOTÓN EDITAR: 
                          1. Agregamos un ID único (id={`btn-edit-${task.id}`}) para poder devolverle el foco después.
                          2. NO usamos aria-expanded aquí porque el botón desaparece al activarse (se reemplaza por el form).
                      */}
                      <button 
                        id={`btn-edit-${task.id}`}
                        onClick={() => startEditing(task)} 
                        aria-label={`Editar tarea: ${task.title}`}
                        style={{ backgroundColor: '#ffc107', color: '#333', fontSize: '0.8rem', padding: '0.4rem' }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)} 
                        aria-label={`Eliminar tarea: ${task.title}`}
                        className="delete-button" 
                        style={{ backgroundColor: '#dc3545', color: 'white', fontSize: '0.8rem', padding: '0.4rem' }}
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
    </div>
  );
}