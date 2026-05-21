/**
 * alertController.js — Alertas de salud (pantalla 4: Alerta roja).
 */
const Alert = require('../models/Alert')
const HistoryEvent = require('../models/HistoryEvent')
require('../models/FamilyMember') // registra el modelo para populate('miembroId')

// Severidad para ordenar las alertas (mayor = más grave, va primero).
const SEVERIDAD = { rojo: 2, ambar: 1, verde: 0 }

// Acciones disponibles en la pantalla de alerta (fijas por ahora).
const ACCIONES = [
  {
    tipo: 'emergencia',
    label: 'Llamar al 118 · Emergencias',
    sub: 'Número nacional de salud Bolivia',
    numero: '118',
  },
  {
    tipo: 'enfermera',
    label: 'Avisar a la enfermera NOVA',
    sub: 'Responde en < 5 minutos',
  },
  {
    tipo: 'clinicas',
    label: 'Clínicas cercanas abiertas',
    sub: '3 clínicas a menos de 2 km',
  },
]

// Textos por defecto si la alerta no los tiene guardados (alertas antiguas).
const LO_QUE_VEMOS_DEFECTO =
  'Detectamos una variación que se mantiene en el tiempo y conviene revisar.'
const MIENTRAS_ESPERAN_DEFECTO =
  'Acompáñala, mantén la calma y procura que esté cómoda y tranquila.'

/**
 * GET /api/alerts/active  (protegida)
 * Alertas no leídas de la familia, ordenadas por gravedad y fecha.
 */
async function getActiveAlerts(req, res) {
  try {
    const alertas = await Alert.find({
      familiaId: req.user.familiaId,
      leida: false,
    }).populate('miembroId', 'nombre apodo')

    // Orden: gravedad descendente y, dentro de la misma, más reciente primero.
    alertas.sort((a, b) => {
      const sev = (SEVERIDAD[b.nivel] || 0) - (SEVERIDAD[a.nivel] || 0)
      if (sev !== 0) return sev
      return new Date(b.detectadoEn || b.createdAt) - new Date(a.detectadoEn || a.createdAt)
    })

    const respuesta = alertas.map((a) => ({
      id: a._id,
      nivel: a.nivel,
      tipo: a.tipo,
      titulo: a.titulo,
      mensaje: a.mensaje,
      detectadoEn: a.detectadoEn,
      leida: a.leida,
      miembro: a.miembroId
        ? { nombre: a.miembroId.nombre, apodo: a.miembroId.apodo }
        : null,
    }))

    return res.status(200).json({ alertas: respuesta })
  } catch (err) {
    console.error('Error en getActiveAlerts:', err)
    return res.status(500).json({ error: 'Error al obtener las alertas activas' })
  }
}

/**
 * Busca una alerta y valida que pertenezca a la familia del usuario.
 * Devuelve la alerta (con miembroId poblado) o null.
 */
async function buscarAlertaDeLaFamilia(alertId, familiaId) {
  let alerta
  try {
    alerta = await Alert.findById(alertId).populate('miembroId', 'nombre apodo')
  } catch (err) {
    return null // id con formato inválido
  }
  if (!alerta) return null
  if (String(alerta.familiaId) !== String(familiaId)) return null
  return alerta
}

/**
 * GET /api/alerts/:id  (protegida)
 * Detalle completo de una alerta para la pantalla 4.
 */
async function getAlertDetail(req, res) {
  try {
    const alerta = await buscarAlertaDeLaFamilia(req.params.id, req.user.familiaId)
    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' })
    }

    return res.status(200).json({
      id: alerta._id,
      nivel: alerta.nivel,
      titulo: alerta.titulo,
      mensaje: alerta.mensaje,
      detectadoEn: alerta.detectadoEn,
      miembro: alerta.miembroId
        ? { nombre: alerta.miembroId.nombre, apodo: alerta.miembroId.apodo }
        : null,
      loQueVemos: alerta.loQueVemos || LO_QUE_VEMOS_DEFECTO,
      acciones: ACCIONES,
      mientrasEsperan: alerta.mientrasEsperan || MIENTRAS_ESPERAN_DEFECTO,
    })
  } catch (err) {
    console.error('Error en getAlertDetail:', err)
    return res.status(500).json({ error: 'Error al obtener la alerta' })
  }
}

/**
 * PUT /api/alerts/:id/read  (protegida)
 * Marca una alerta como leída.
 */
async function markAsRead(req, res) {
  try {
    const alerta = await buscarAlertaDeLaFamilia(req.params.id, req.user.familiaId)
    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' })
    }

    alerta.leida = true
    await alerta.save()

    return res.status(200).json({ id: alerta._id, leida: true })
  } catch (err) {
    console.error('Error en markAsRead:', err)
    return res.status(500).json({ error: 'Error al marcar la alerta como leída' })
  }
}

/**
 * POST /api/alerts/:id/notify-nurse  (protegida)
 * Avisa a la enfermera NOVA. Mock: sólo registra el evento en el historial.
 */
async function notifyNurse(req, res) {
  try {
    const alerta = await buscarAlertaDeLaFamilia(req.params.id, req.user.familiaId)
    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' })
    }

    const ahora = new Date()
    await HistoryEvent.create({
      miembroId: alerta.miembroId._id || alerta.miembroId,
      tipo: 'llamada',
      color: 'azul',
      texto: 'Aviso enviado a la enfermera NOVA · responde en menos de 5 minutos',
      horaTexto: ahora.toTimeString().slice(0, 5),
      fechaEvento: ahora,
    })

    return res.status(200).json({
      mensaje: 'Hemos avisado a la enfermera NOVA. Responde en menos de 5 minutos.',
      alertaId: alerta._id,
    })
  } catch (err) {
    console.error('Error en notifyNurse:', err)
    return res.status(500).json({ error: 'Error al avisar a la enfermera' })
  }
}

module.exports = { getActiveAlerts, getAlertDetail, markAsRead, notifyNurse }
