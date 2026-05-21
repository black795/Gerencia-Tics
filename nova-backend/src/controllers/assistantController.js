/**
 * assistantController.js — Asistente de voz NOVA (pantalla 5).
 *
 * MOCK: las respuestas son predefinidas y se eligen por palabras clave.
 * NO usa IA real. El procesamiento se reporta como "local" para reflejar
 * el diferencial de privacidad del producto (los datos no salen del hogar).
 */
const Conversation = require('../models/Conversation')
const { miembroDeLaFamilia } = require('../utils/familyGuard')

// Sugerencias fijas que acompañan cada respuesta.
const SUGERENCIAS = ['¿Avisar a la enfermera?', 'Ver detalle']

// Marcas diacríticas combinantes (acentos, tilde de la ñ) en Unicode.
const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g')

// Normaliza un texto: minúsculas y sin acentos, para comparar palabras clave.
function normalizar(texto) {
  return (texto || '').toLowerCase().normalize('NFD').replace(DIACRITICOS, '')
}

// Elige la respuesta mock según las palabras clave del mensaje.
function responderMock(mensaje, apodo) {
  const t = normalizar(mensaje)

  if (t.includes('durmio') || t.includes('sueno')) {
    return (
      `${apodo} durmió de forma irregular las últimas noches: se despertó un par ` +
      'de veces y acumuló menos horas de las recomendadas. No es alarmante, pero ' +
      'conviene cuidar su rutina de descanso. Seguimos observándola.'
    )
  }
  if (t.includes('grave') || t.includes('preocup')) {
    return (
      `Por lo que vemos, no hay motivo para alarmarse. Los valores de ${apodo} están ` +
      'dentro de lo esperado para la altura. Seguimos observando y te avisaremos de ' +
      'inmediato si algo cambia.'
    )
  }
  if (t.includes('medico') || t.includes('doctor')) {
    return (
      `Si querés una valoración profesional, podemos compartir el reporte de ${apodo} ` +
      'con su médico de confianza o avisar a la enfermera NOVA. ¿Te ayudo a coordinarlo?'
    )
  }
  return 'Estoy aquí para ayudarte. ¿Sobre qué miembro de la familia quieres saber?'
}

/**
 * POST /api/assistant/message  (protegida)
 * Body: { miembroId, mensaje }
 */
async function sendMessage(req, res) {
  try {
    const { miembroId, mensaje } = req.body || {}

    if (!miembroId || !mensaje || !mensaje.trim()) {
      return res.status(400).json({ error: 'Faltan el miembro o el mensaje' })
    }

    const miembro = await miembroDeLaFamilia(miembroId, req.user.familiaId)
    if (!miembro) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }

    const apodo = miembro.apodo || miembro.nombre
    const respuesta = responderMock(mensaje, apodo)
    const ahora = new Date()

    // Persistir la interacción en la conversación del miembro.
    let conversacion = await Conversation.findOne({ miembroId: miembro._id })
    if (!conversacion) {
      conversacion = new Conversation({ miembroId: miembro._id, mensajes: [] })
    }
    conversacion.mensajes.push({ rol: 'user', texto: mensaje.trim(), timestamp: ahora })
    conversacion.mensajes.push({ rol: 'nova', texto: respuesta, timestamp: ahora })
    // Mantener acotado el historial almacenado.
    if (conversacion.mensajes.length > 40) {
      conversacion.mensajes = conversacion.mensajes.slice(-40)
    }
    await conversacion.save()

    return res.status(200).json({
      respuesta,
      procesamiento: 'local',
      sugerencias: SUGERENCIAS,
    })
  } catch (err) {
    console.error('Error en sendMessage:', err)
    return res.status(500).json({ error: 'Error al procesar el mensaje' })
  }
}

/**
 * GET /api/assistant/conversation/:miembroId  (protegida)
 * Devuelve las últimas 10 interacciones (20 mensajes user/nova) del miembro.
 */
async function getConversation(req, res) {
  try {
    const miembro = await miembroDeLaFamilia(req.params.miembroId, req.user.familiaId)
    if (!miembro) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }

    const conversacion = await Conversation.findOne({ miembroId: miembro._id })
    const mensajes = conversacion ? conversacion.mensajes.slice(-20) : []

    return res.status(200).json({ miembroId: miembro._id, mensajes })
  } catch (err) {
    console.error('Error en getConversation:', err)
    return res.status(500).json({ error: 'Error al obtener la conversación' })
  }
}

module.exports = { sendMessage, getConversation }
