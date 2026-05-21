/**
 * errorHandler.js — Manejo global de errores y rutas no encontradas.
 * Garantiza que la API siempre responda con JSON consistente.
 */

// 404: ninguna ruta coincidió con la petición.
function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' })
}

// Manejador de errores no controlados (debe declararse con 4 argumentos).
function errorHandler(err, req, res, next) {
  console.error('Error no controlado:', err)
  const status = err.status || 500
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
  })
}

module.exports = { notFound, errorHandler }
