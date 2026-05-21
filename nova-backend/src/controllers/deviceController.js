/**
 * deviceController.js — Dispositivos de la familia (pantalla 7: Configuración).
 */
const Device = require('../models/Device')
const FamilyMember = require('../models/FamilyMember')
const { miembroDeLaFamilia } = require('../utils/familyGuard')

// Tipos de dispositivo admitidos (debe coincidir con el enum del modelo Device).
const TIPOS_VALIDOS = ['mi_band', 'apple_watch', 'garmin', 'fitbit', 'oximetro', 'otro']

/**
 * GET /api/devices  (protegida)
 * Lista los dispositivos de la familia del usuario.
 */
async function getDevices(req, res) {
  try {
    const dispositivos = await Device.find({ familiaId: req.user.familiaId }).sort({
      createdAt: 1,
    })
    return res.status(200).json({ dispositivos })
  } catch (err) {
    console.error('Error en getDevices:', err)
    return res.status(500).json({ error: 'Error al obtener los dispositivos' })
  }
}

/**
 * POST /api/devices  (protegida)
 * Agrega un nuevo dispositivo a la familia.
 * Body: { tipo, nombre, miembroId? }
 */
async function addDevice(req, res) {
  try {
    const { tipo, nombre, miembroId } = req.body || {}

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        error: `Tipo de dispositivo no válido. Valores admitidos: ${TIPOS_VALIDOS.join(', ')}`,
      })
    }
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre del dispositivo es obligatorio' })
    }

    // Si se vincula a un miembro, debe pertenecer a la familia del usuario.
    if (miembroId) {
      const miembro = await miembroDeLaFamilia(miembroId, req.user.familiaId)
      if (!miembro) {
        return res.status(404).json({ error: 'Miembro no encontrado' })
      }
    }

    const dispositivo = await Device.create({
      familiaId: req.user.familiaId,
      miembroId: miembroId || undefined,
      tipo,
      nombre: nombre.trim(),
      activo: true,
      ultimoSync: new Date(),
    })

    // Si se vinculó a un miembro, dejarlo como su dispositivo.
    if (miembroId) {
      await FamilyMember.findByIdAndUpdate(miembroId, { dispositivoId: dispositivo._id })
    }

    return res.status(201).json({ dispositivo })
  } catch (err) {
    console.error('Error en addDevice:', err)
    return res.status(500).json({ error: 'Error al agregar el dispositivo' })
  }
}

/**
 * DELETE /api/devices/:id  (protegida)
 * Elimina un dispositivo de la familia.
 */
async function removeDevice(req, res) {
  try {
    let dispositivo
    try {
      dispositivo = await Device.findById(req.params.id)
    } catch (err) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' })
    }
    if (!dispositivo) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' })
    }
    if (String(dispositivo.familiaId) !== String(req.user.familiaId)) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' })
    }

    // Desvincular el dispositivo de cualquier miembro que lo tuviera asignado.
    await FamilyMember.updateMany(
      { dispositivoId: dispositivo._id },
      { $unset: { dispositivoId: '' } },
    )
    await dispositivo.deleteOne()

    return res.status(200).json({ id: dispositivo._id, eliminado: true })
  } catch (err) {
    console.error('Error en removeDevice:', err)
    return res.status(500).json({ error: 'Error al eliminar el dispositivo' })
  }
}

module.exports = { getDevices, addDevice, removeDevice }
