const mongoose = require('mongoose')

// Un mensaje dentro de la conversación con el asistente NOVA.
const mensajeSchema = new mongoose.Schema(
  {
    rol: { type: String, enum: ['user', 'nova'], required: true },
    texto: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
)

// Una conversación por miembro monitoreado.
const conversationSchema = new mongoose.Schema(
  {
    miembroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
      unique: true,
    },
    mensajes: [mensajeSchema],
  },
  { timestamps: true },
)

module.exports = mongoose.model('Conversation', conversationSchema)
