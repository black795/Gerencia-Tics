const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const {
  getDevices,
  addDevice,
  removeDevice,
} = require('../controllers/deviceController')

// Todas las rutas de dispositivos requieren autenticación.
router.get('/', auth, getDevices)
router.post('/', auth, addDevice)
router.delete('/:id', auth, removeDevice)

module.exports = router
