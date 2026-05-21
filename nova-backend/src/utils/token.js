const jwt = require('jsonwebtoken')

// El payload del JWT lleva lo mínimo para identificar al usuario en cada request.
function generarToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      familiaId: user.familiaId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

module.exports = { generarToken }
