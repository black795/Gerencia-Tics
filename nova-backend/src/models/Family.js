const mongoose = require('mongoose')

const familySchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    ubicacion: {
      ciudad: { type: String },
      altitudMetros: { type: Number },
    },
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }, // agrega createdAt y updatedAt
)

module.exports = mongoose.model('Family', familySchema)
