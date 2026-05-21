const mongoose = require('mongoose')

const historyEventSchema = new mongoose.Schema(
  {
    miembroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: [
        'sueño',
        'saturacion',
        'frecuencia',
        'presion',
        'reporte',
        'llamada',
        'alerta',
      ],
    },
    color: { type: String, enum: ['verde', 'ambar', 'rojo', 'azul'] },
    texto: { type: String },
    horaTexto: { type: String }, // ej: "02:14 y 03:58"
    fechaEvento: { type: Date, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

module.exports = mongoose.model('HistoryEvent', historyEventSchema)
