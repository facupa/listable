require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_provisoria";

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("¡Conectado a MongoDB!"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// --- MODELOS ---

// Usuario
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// Tarea (Con referencia al usuario "dueño")
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // <--- ESTO ES VITAL
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

// --- MIDDLEWARE DE SEGURIDAD ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Guardamos quién es el usuario
    next();
  });
};

// --- RUTAS PÚBLICAS (Login/Registro) ---

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "El correo ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Usuario creado" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- RUTAS PRIVADAS (Solo mostramos mis tareas) ---

// 1. LEER (Solo las mías)
app.get("/api/tasks", authenticateToken, async (req, res) => {
  try {
    // FILTRO: Solo busco tareas donde user == mi ID
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. CREAR (A mi nombre)
app.post("/api/tasks", authenticateToken, async (req, res) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    user: req.user.id // <--- ASIGNO LA TAREA A MÍ MISMO
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. EDITAR (Solo si es mi tarea)
app.patch("/api/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "No autorizado o no encontrada" });

    if (req.body.title != null) task.title = req.body.title;
    if (req.body.description != null) task.description = req.body.description;
    if (req.body.completed != null) task.completed = req.body.completed;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. ELIMINAR (Solo si es mi tarea)
app.delete("/api/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "No autorizado o no encontrada" });
    res.json({ message: "Tarea eliminada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));