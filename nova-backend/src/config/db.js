const mongoose = require('mongoose')

/**
 * Conecta a MongoDB usando la URI definida en la variable de entorno MONGO_URI.
 * Si la conexión falla, registra el error pero NO detiene el proceso, de modo
 * que el servidor (y la ruta /api/health) sigan respondiendo.
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB conectado')
  } catch (err) {
    console.error('Error al conectar con MongoDB:', err.message)
  }
}

module.exports = connectDB
