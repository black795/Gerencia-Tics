const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema(
  {
    familiaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
    miembroId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
    tipo: {
      type: String,
      enum: ['mi_band', 'apple_watch', 'garmin', 'fitbit', 'oximetro', 'otro'],
    },
    nombre: { type: String },
    activo: { type: Boolean },
    ultimoSync: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

module.exports = mongoose.model('Device', deviceSchema)
