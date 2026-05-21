const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const {
  getDashboard,
  getMembers,
  getMember,
} = require('../controllers/familyController')

// Todas las rutas de familia requieren autenticación.
router.get('/dashboard', auth, getDashboard)
router.get('/members', auth, getMembers)
router.get('/members/:id', auth, getMember)

module.exports = router
