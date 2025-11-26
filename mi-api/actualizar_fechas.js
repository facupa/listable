require('dotenv').config();
const mongoose = require('mongoose');

// Tu conexión
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("🟠 Conectado a MongoDB. Iniciando actualización...");

    // Definimos el modelo temporalmente para este script
    const Task = mongoose.model("Task", new mongoose.Schema({}, { strict: false }));

    // Buscamos tareas que NO tengan el campo 'createdAt'
    // y les ponemos la fecha actual (new Date())
    const resultado = await Task.updateMany(
      { createdAt: { $exists: false } }, // Filtro: ¿Falta la fecha?
      { 
        $set: { 
          createdAt: new Date(), // Ponemos la fecha de "ahora"
          updatedAt: new Date()
        } 
      }
    );

    console.log(`✅ ¡Listo! Se actualizaron ${resultado.modifiedCount} tareas antiguas.`);
    console.log("Ya puedes cerrar esto y volver a iniciar tu servidor normal.");
    
    // Cerramos la conexión
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ Error:", err);
  });