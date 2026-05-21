const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const {
  getActiveAlerts,
  getAlertDetail,
  markAsRead,
  notifyNurse,
} = require('../controllers/alertController')

// Todas las rutas de alertas requieren autenticación.
// '/active' va antes de '/:id' para que no lo capture como un id.
router.get('/active', auth, getActiveAlerts)
router.get('/:id', auth, getAlertDetail)
router.put('/:id/read', auth, markAsRead)
router.post('/:id/notify-nurse', auth, notifyNurse)

module.exports = router
