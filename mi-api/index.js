require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Inicializar la app
const app = express();
const PORT = 5000; 

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Conexión a MongoDB
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("¡Conectado a MongoDB!"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// --- ESQUEMA CON FECHAS AUTOMÁTICAS ---
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: {
    type: Boolean,
    default: false,
  },
}, { 
  timestamps: true // <--- ESTA LÍNEA HACE LA MAGIA (crea 'createdAt' y 'updatedAt')
});

const Task = mongoose.model("Task", taskSchema); 

// --- RUTAS DE LA API ---

// 1. OBTENER TODAS LAS TAREAS
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find(); 
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. CREAR UNA TAREA
app.post("/api/tasks", async (req, res) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
  });

  try {
    const newTask = await task.save(); 
    res.status(201).json(newTask); 
  } catch (err) {
    res.status(400).json({ message: err.message }); 
  }
});

// 3. ACTUALIZAR UNA TAREA (Título, descripción o estado)
app.patch("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (task == null) {
            return res.status(404).json({ message: "No se encontró la tarea" });
        }

        // Actualiza solo los campos que vengan en la petición
        if (req.body.title != null) {
            task.title = req.body.title;
        }
        if (req.body.description != null) {
            task.description = req.body.description;
        }
        if (req.body.completed != null) {
            task.completed = req.body.completed;
        }

        const updatedTask = await task.save();
        res.json(updatedTask);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. ELIMINAR UNA TAREA
app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        
        if (task == null) {
             return res.status(404).json({ message: "No se encontró la tarea" });
        }

        res.json({ message: "Tarea eliminada correctamente" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});