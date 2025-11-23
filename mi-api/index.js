require('dotenv').config(); // <--- LÍNEA NUEVA (Línea 1)
// 1. Importar las dependencias (ESTO ES DE TU BASE ORIGINAL)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 2. Inicializar la app de Express (ESTO ES DE TU BASE ORIGINAL)
const app = express();
const PORT = 5000; 

// 3. Configurar "Middlewares" (ESTO ES DE TU BASE ORIGINAL)
app.use(cors()); 
app.use(express.json()); 

// 4. Conectar a MongoDB Atlas (ESTO ES DE TU BASE ORIGINAL)
// ¡¡ASEGÚRATE DE QUE AQUÍ ESTÉ TU LLAVE REAL!!
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("¡Conectado a MongoDB!"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// 5. Definir el "Esquema" y "Modelo" de la Tarea (ESTO ES DE TU BASE ORIGINAL)
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model("Task", taskSchema); 

// ---------------------------------------------------------------
// 6. Definir las rutas de la API (CRUD Completo)
// ---------------------------------------------------------------

/*
 * @ruta   GET /api/tasks
 * @desc   Obtener todas las tareas (LEER)
 * (Esta ruta ya la tenías en la v1)
 */
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find(); 
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*
 * @ruta   POST /api/tasks
 * @desc   Añadir una nueva tarea (AGREGAR / CREAR)
 * (Esta ruta ya la tenías en la v1)
 */
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

/*
 * @ruta   PATCH /api/tasks/:id
 * @desc   Actualizar una tarea (EDITAR / ACTUALIZAR)
 * (Esta es la ruta MEJORADA que reemplaza a tu 'PUT' anterior)
 */
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


/*
 * @ruta   DELETE /api/tasks/:id
 * @desc   Eliminar una tarea (ELIMINAR)
 * (Esta es la ruta NUEVA que añadimos)
 */
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


// 7. Iniciar el servidor (ESTO ES DE TU BASE ORIGINAL)
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});