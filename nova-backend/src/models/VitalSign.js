const mongoose = require('mongoose')

const vitalSignSchema = new mongoose.Schema(
  {
    miembroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
      index: true,
    },
    timestamp: { type: Date, index: true },
    saturacionO2: { type: Number },
    frecuenciaCardiaca: { type: Number },
    presionSistolica: { type: Number },
    presionDiastolica: { type: Number },
    horasSueno: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

module.exports = mongoose.model('VitalSign', vitalSignSchema)
