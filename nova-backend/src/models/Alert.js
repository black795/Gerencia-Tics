const mongoose = require('mongoose')

const alertSchema = new mongoose.Schema(
  {
    miembroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    familiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      index: true,
    },
    nivel: { type: String, enum: ['verde', 'ambar', 'rojo'] },
    tipo: { type: String }, // ej: "saturacion_baja", "sueño_irregular"
    titulo: { type: String },
    mensaje: { type: String },
    detectadoEn: { type: Date },
    leida: { type: Boolean, default: false },
    // Textos de la pantalla 4 (alerta roja), guardados al generar la alerta.
    loQueVemos: { type: String },
    mientrasEsperan: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

module.exports = mongoose.model('Alert', alertSchema)
