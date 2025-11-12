import React, { useState, useEffect } from 'react';
import { Plus, Check, Edit2, Trash2, Filter, Calendar, Clock } from 'lucide-react';
import "./styles.css"; 

const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  // Cargar tareas al iniciar
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Guardar tareas automáticamente
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Agregar nueva tarea
  const handleAddTask = () => {
    if (newTask.title.trim() === '') {
      alert('El título es obligatorio');
      return;
    }

    const task = {
      id: Date.now(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      priority: newTask.priority,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([task, ...tasks]);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setShowForm(false);
  };

  // Actualizar tarea
  const handleUpdateTask = () => {
    if (editingTask.title.trim() === '') {
      alert('El título es obligatorio');
      return;
    }

    setTasks(tasks.map(task => 
      task.id === editingTask.id ? { ...editingTask, title: editingTask.title.trim(), description: editingTask.description.trim() } : task
    ));
    setEditingTask(null);
  };

  // Marcar como completada/pendiente
  const toggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Eliminar tarea
  const handleDeleteTask = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Estadísticas
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  // Colores de prioridad
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">📋 Mi Lista de Tareas</h1>
          <p className="text-indigo-100">Organiza tu día de manera eficiente</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Tareas</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="text-blue-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="text-yellow-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completadas</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="text-green-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Control */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Botón Nueva Tarea */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-md transition-all transform hover:scale-105"
            >
              <Plus size={22} />
              Nueva Tarea
            </button>

            {/* Filtro */}
            <div className="w-full md:w-auto flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer"
              >
                <option value="all">Todas las tareas</option>
                <option value="pending">Pendientes</option>
                <option value="completed">Completadas</option>
              </select>
            </div>
          </div>

          {/* Formulario de Nueva Tarea */}
          {showForm && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">✨ Crear Nueva Tarea</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título de la Tarea *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="¿Qué necesitas hacer?"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Añade más detalles sobre esta tarea..."
                    rows="3"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddTask}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
                  >
                    ✓ Guardar Tarea
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setNewTask({ title: '', description: '', priority: 'medium' });
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Tareas */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {filter === 'all' && 'Todas las Tareas'}
            {filter === 'pending' && 'Tareas Pendientes'}
            {filter === 'completed' && 'Tareas Completadas'}
          </h2>

          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
              <div className="text-8xl mb-6">
                {filter === 'completed' ? '🎉' : '📝'}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {filter === 'all' && 'No hay tareas creadas'}
                {filter === 'pending' && '¡Excelente! No hay tareas pendientes'}
                {filter === 'completed' && 'No hay tareas completadas aún'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' && 'Comienza agregando tu primera tarea'}
                {filter === 'pending' && 'Todas tus tareas están completas'}
                {filter === 'completed' && 'Completa algunas tareas para verlas aquí'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${
                    task.completed ? 'opacity-70 bg-gray-50' : ''
                  }`}
                >
                  {editingTask?.id === task.id ? (
                    // Modo Edición
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Título *
                        </label>
                        <input
                          type="text"
                          value={editingTask.title}
                          onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateTask()}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={editingTask.description}
                          onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                          rows="3"
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Prioridad
                        </label>
                        <select
                          value={editingTask.priority}
                          onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleUpdateTask}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo Visualización
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className={`flex-shrink-0 w-7 h-7 rounded-full border-3 flex items-center justify-center transition-all mt-1 ${
                          task.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-400 hover:border-green-500 hover:bg-green-50'
                        }`}
                      >
                        {task.completed && <Check size={18} className="text-white font-bold" />}
                      </button>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <h3
                            className={`text-lg font-bold flex-1 ${
                              task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                            }`}
                          >
                            {task.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className={`mb-3 ${
                            task.completed ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar size={14} />
                          <span>
                            {new Date(task.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(task.createdAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar tarea"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar tarea"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6 inline-block">
            <p className="text-gray-600 mb-1">
              💡 <strong>Tip:</strong> Las tareas se guardan automáticamente en tu navegador
            </p>
            <p className="text-sm text-gray-500">
              Presiona Enter para guardar rápidamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
