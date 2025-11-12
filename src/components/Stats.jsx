 export default function Stats({ stats }) {
  const { total, pending, completed } = stats;
  return (
    <section className="stats">
      <div className="card stat total">
        <span className="stat-label">Total de Tareas</span>
        <span className="stat-value">{total}</span>
      </div>
      <div className="card stat pending">
        <span className="stat-label">Pendientes</span>
        <span className="stat-value">{pending}</span>
      </div>
      <div className="card stat completed">
        <span className="stat-label">Completadas</span>
        <span className="stat-value">{completed}</span>
      </div>
    </section>
  );
}
