const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    nombre: { type: String },
    apellido: { type: String },
    familiaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
    plan: { type: String, enum: ['free', 'familiar'], default: 'free' },
    planRenovacion: { type: Date },
  },
  { timestamps: true }, // agrega createdAt y updatedAt
)

module.exports = mongoose.model('User', userSchema)
