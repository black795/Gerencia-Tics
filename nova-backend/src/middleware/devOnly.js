/**
 * devOnly.js — Restringe rutas al entorno de desarrollo / demo.
 * Si NODE_ENV es "production", la ruta queda bloqueada con 403.
 */
module.exports = function devOnly(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Las rutas de desarrollo no están disponibles en producción',
    })
  }
  next()
}
