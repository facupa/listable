import { useState } from "react";

export default function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
        setEmail("");
        setPassword("");
      } else {
        setError(data.message || "Error al registrarse");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="auth-container">
      <h2>Crear Cuenta</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="reg-email">Correo Electrónico</label>
        <input
          type="email"
          id="reg-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <label htmlFor="reg-password">Contraseña</label>
        <input
          type="password"
          id="reg-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>
      </form>
      
      <p>
        ¿Ya tienes cuenta?{" "}
        <button className="link-button" onClick={onSwitchToLogin}>
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
}