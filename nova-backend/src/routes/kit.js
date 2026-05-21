const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const {
  getKitInfo,
  checkEligibility,
  requestKit,
} = require('../controllers/kitController')

// La información del Kit es pública; elegibilidad y pedido requieren auth.
router.get('/info', getKitInfo)
router.get('/eligibility', auth, checkEligibility)
router.post('/request', auth, requestKit)

module.exports = router
