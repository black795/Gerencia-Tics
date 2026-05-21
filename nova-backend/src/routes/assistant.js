const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const {
  sendMessage,
  getConversation,
} = require('../controllers/assistantController')

// Todas las rutas del asistente requieren autenticación.
router.post('/message', auth, sendMessage)
router.get('/conversation/:miembroId', auth, getConversation)

module.exports = router
