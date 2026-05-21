/**
 * settingsController.js — Ajustes y plan del usuario (pantalla 7: Configuración).
 */
const Settings = require('../models/Settings')
const User = require('../models/User')

// Toggles que el cliente puede modificar.
const TOGGLES = [
  'procesamientoLocal',
  'compartirConMedico',
  'alertasWhatsapp',
  'luzAmbiental',
]

const MESES_ABR = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

// Devuelve sólo los campos de toggles del documento de settings.
function soloToggles(s) {
  return {
    procesamientoLocal: s.procesamientoLocal,
    compartirConMedico: s.compartirConMedico,
    alertasWhatsapp: s.alertasWhatsapp,
    luzAmbiental: s.luzAmbiental,
  }
}

// Busca los settings del usuario; si no existen, los crea por defecto.
async function obtenerOcrear(userId) {
  let settings = await Settings.findOne({ userId })
  if (!settings) {
    settings = await Settings.create({ userId })
  }
  return settings
}

/**
 * GET /api/settings  (protegida)
 */
async function getSettings(req, res) {
  try {
    const settings = await obtenerOcrear(req.user.id)
    return res.status(200).json(soloToggles(settings))
  } catch (err) {
    console.error('Error en getSettings:', err)
    return res.status(500).json({ error: 'Error al obtener los ajustes' })
  }
}

/**
 * PUT /api/settings  (protegida)
 * Body: { procesamientoLocal, compartirConMedico, alertasWhatsapp, luzAmbiental }
 * Sólo se aplican los toggles presentes y de tipo booleano.
 */
async function updateSettings(req, res) {
  try {
    const body = req.body || {}
    const settings = await obtenerOcrear(req.user.id)

    for (const clave of TOGGLES) {
      if (typeof body[clave] === 'boolean') {
        settings[clave] = body[clave]
      }
    }
    await settings.save()

    return res.status(200).json(soloToggles(settings))
  } catch (err) {
    console.error('Error en updateSettings:', err)
    return res.status(500).json({ error: 'Error al actualizar los ajustes' })
  }
}

/**
 * GET /api/settings/plan  (protegida)
 * Datos de la suscripción del usuario.
 */
async function getPlan(req, res) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const activa = !!user.plan && user.plan !== 'free'

    let renovacion = null
    if (user.planRenovacion) {
      const d = new Date(user.planRenovacion)
      renovacion = `${d.getDate()} ${MESES_ABR[d.getMonth()]}`
    }

    return res.status(200).json({
      nombre: activa ? 'Suscripción Familiar' : 'Plan Gratuito',
      activa,
      renovacion,
      badge: activa ? 'Activo' : 'Inactivo',
    })
  } catch (err) {
    console.error('Error en getPlan:', err)
    return res.status(500).json({ error: 'Error al obtener el plan' })
  }
}

module.exports = { getSettings, updateSettings, getPlan }
