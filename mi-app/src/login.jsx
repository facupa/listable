import { useState } from "react";

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ¡Éxito! Enviamos el token al componente padre (App)
        onLogin(data.token);
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="login-email">Correo Electrónico</label>
        <input
          type="email"
          id="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <label htmlFor="login-password">Contraseña</label>
        <input
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
      </form>
      
      <p>
        ¿No tienes cuenta?{" "}
        <button className="link-button" onClick={onSwitchToRegister}>
          Regístrate aquí
        </button>
      </p>
    </div>
  );
}