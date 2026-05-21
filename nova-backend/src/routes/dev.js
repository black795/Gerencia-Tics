const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const devOnly = require('../middleware/devOnly')
const { forceScenario, resetMember } = require('../controllers/devController')

// Rutas de desarrollo: bloqueadas en producción (devOnly) y autenticadas.
router.post('/scenario', devOnly, auth, forceScenario)
router.post('/reset/:miembroId', devOnly, auth, resetMember)

module.exports = router
