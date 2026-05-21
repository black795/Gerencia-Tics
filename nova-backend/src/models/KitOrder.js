const mongoose = require('mongoose')

// Pedido del Kit familiar NOVA (pantalla 8).
const kitOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    familiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmado', 'enviado', 'entregado'],
      default: 'pendiente',
    },
    direccionEnvio: { type: String },
    telefono: { type: String },
    montoTotal: { type: Number },
    fechaPedido: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

module.exports = mongoose.model('KitOrder', kitOrderSchema)
