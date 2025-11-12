 import { useEffect, useRef, useState } from "react";

export default function TaskForm({ mode, initialTask, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [priority, setPriority] = useState(initialTask?.priority || "media");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, priority });
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{mode === "create" ? "Nueva Tarea" : "Editar Tarea"}</h2>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Título *</label>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ej: Comprar insumos"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            required
          />
        </div>

        <div className="field">
          <label>Descripción</label>
          <textarea
            placeholder="Detalles opcionales"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="field">
          <label>Prioridad</label>
          <div className="priority-group">
            <label className={`pill alta ${priority === "alta" ? "active" : ""}`}>
              <input
                type="radio"
                name="priority"
                value="alta"
                checked={priority === "alta"}
                onChange={(e) => setPriority(e.target.value)}
              />
              Alta
            </label>
            <label className={`pill media ${priority === "media" ? "active" : ""}`}>
              <input
                type="radio"
                name="priority"
                value="media"
                checked={priority === "media"}
                onChange={(e) => setPriority(e.target.value)}
              />
              Media
            </label>
            <label className={`pill baja ${priority === "baja" ? "active" : ""}`}>
              <input
                type="radio"
                name="priority"
                value="baja"
                checked={priority === "baja"}
                onChange={(e) => setPriority(e.target.value)}
              />
              Baja
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary">
          {mode === "create" ? "Agregar" : "Guardar"}
        </button>
        <button type="button" className="ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
