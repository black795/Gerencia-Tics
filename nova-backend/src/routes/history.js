const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const { getHistory, getWeeklyReport } = require('../controllers/historyController')

// Todas las rutas de historial requieren autenticación.
// La ruta específica va antes de la genérica '/:miembroId'.
router.get('/:miembroId/weekly-report', auth, getWeeklyReport)
router.get('/:miembroId', auth, getHistory)

module.exports = router
