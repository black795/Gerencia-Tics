const mongoose = require('mongoose')

const familyMemberSchema = new mongoose.Schema(
  {
    familiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
    },
    nombre: { type: String },
    apodo: { type: String },
    edad: { type: Number },
    iniciales: { type: String }, // para el avatar, ej: "PT"
    estadoActual: {
      type: String,
      enum: ['verde', 'ambar', 'rojo'],
      default: 'verde',
    },
    mensajeEstado: { type: String },
    dispositivoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
  },
  { timestamps: true }, // agrega createdAt y updatedAt
)

module.exports = mongoose.model('FamilyMember', familyMemberSchema)
