const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const { getCurrentVitals, getVitalsRange } = require('../controllers/vitalsController')

// Todas las rutas de signos vitales requieren autenticación.
router.get('/:miembroId/current', auth, getCurrentVitals)
router.get('/:miembroId/range', auth, getVitalsRange)

module.exports = router
