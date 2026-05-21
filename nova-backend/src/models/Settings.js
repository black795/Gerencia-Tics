const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
  },
  procesamientoLocal: { type: Boolean, default: true },
  compartirConMedico: { type: Boolean, default: false },
  alertasWhatsapp: { type: Boolean, default: true },
  luzAmbiental: { type: Boolean, default: false },
})

module.exports = mongoose.model('Settings', settingsSchema)
