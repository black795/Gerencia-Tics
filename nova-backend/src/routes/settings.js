const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const {
  getSettings,
  updateSettings,
  getPlan,
} = require('../controllers/settingsController')

// Todas las rutas de ajustes requieren autenticación.
router.get('/plan', auth, getPlan)
router.get('/', auth, getSettings)
router.put('/', auth, updateSettings)

module.exports = router
