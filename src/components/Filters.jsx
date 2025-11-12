 export default function Filters({ filter, onChange }) {
  return (
    <div className="filters">
      <label htmlFor="filter">Ver:</label>
      <select
        id="filter"
        value={filter}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">Todas las tareas</option>
        <option value="pending">Solo pendientes</option>
        <option value="completed">Solo completadas</option>
      </select>
    </div>
  );
}
