const jwt = require('jsonwebtoken')

/**
 * Middleware de autenticación.
 * Espera el header "Authorization: Bearer <token>".
 * Si el JWT es válido agrega req.user = { id, email, familiaId }.
 * Si no, responde 401.
 */
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || ''

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = header.slice(7).trim()

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      id: payload.id,
      email: payload.email,
      familiaId: payload.familiaId,
    }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
