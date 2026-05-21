/**
 * devController.js — Modo desarrollo / demo.
 *
 * Permite forzar escenarios de salud y resetear miembros para grabar demos.
 * NO debe usarse en producción: las rutas están protegidas por el middleware
 * `devOnly` (verifica NODE_ENV).
 */
const Family = require('../models/Family')
const VitalSign = require('../models/VitalSign')
const Alert = require('../models/Alert')
const { generarLectura } = require('../utils/vitalsSimulator')
const { crearAlertaSiCorresponde, interpretarLectura } = require('../utils/alertEngine')
const { miembroDeLaFamilia } = require('../utils/familyGuard')

const ESCENARIOS = ['verde', 'ambar', 'rojo']
const LECTURAS_POR_ESCENARIO = 5
const MIN_ENTRE_LECTURAS = 10 // separación temporal entre lecturas forzadas

// Genera una lectura cuya interpretación global coincide con el escenario.
// `generarLectura` es aleatorio (una ronda ámbar puede salir verde), así que
// reintentamos hasta obtener el estado pedido.
function generarLecturaObjetivo(miembro, fecha, escenario, altitud) {
  for (let intento = 0; intento < 60; intento++) {
    const lectura = generarLectura(miembro, fecha, escenario)
    if (interpretarLectura(lectura, miembro, altitud).global === escenario) {
      return lectura
    }
  }
  return generarLectura(miembro, fecha, escenario) // fallback improbable
}

// Mensaje de estado en lenguaje natural según el escenario.
function mensajeEstado(escenario, lectura) {
  if (escenario === 'verde') {
    return `Saturación ${lectura.saturacionO2}% · estable para la altura`
  }
  if (escenario === 'ambar') {
    return 'Hay valores que conviene observar hoy. La revisaremos juntos.'
  }
  return 'Algunos signos necesitan atención. Conviene revisarlo pronto.'
}

/**
 * POST /api/dev/scenario  (dev only, protegida)
 * Body: { miembroId, escenario: "verde"|"ambar"|"rojo" }
 * Genera 5 lecturas consecutivas que disparan el estado pedido.
 */
async function forceScenario(req, res) {
  try {
    const { miembroId, escenario } = req.body || {}

    if (!miembroId || !ESCENARIOS.includes(escenario)) {
      return res.status(400).json({
        error: `Faltan datos. "escenario" debe ser uno de: ${ESCENARIOS.join(', ')}`,
      })
    }

    const miembro = await miembroDeLaFamilia(miembroId, req.user.familiaId)
    if (!miembro) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }

    const familia = await Family.findById(miembro.familiaId)
    const altitud = familia?.ubicacion?.altitudMetros || 0

    // 5 lecturas consecutivas: la más antigua hace 40 min, la última ahora.
    const ahora = Date.now()
    let ultimaLectura
    for (let i = 0; i < LECTURAS_POR_ESCENARIO; i++) {
      const offset = (LECTURAS_POR_ESCENARIO - 1 - i) * MIN_ENTRE_LECTURAS
      const fecha = new Date(ahora - offset * 60000)
      ultimaLectura = generarLecturaObjetivo(miembro, fecha, escenario, altitud)
      await VitalSign.create({
        miembroId: miembro._id,
        timestamp: fecha,
        ...ultimaLectura,
      })
    }

    // Actualizar el estado del miembro según la última lectura.
    miembro.estadoActual = escenario
    miembro.mensajeEstado = mensajeEstado(escenario, ultimaLectura)
    await miembro.save()

    // Disparar el motor de alertas (creará Alert + HistoryEvent si procede).
    const alerta = await crearAlertaSiCorresponde(miembro, familia)

    return res.status(200).json({
      miembroId: miembro._id,
      escenario,
      lecturasGeneradas: LECTURAS_POR_ESCENARIO,
      estadoActual: miembro.estadoActual,
      alerta: alerta
        ? { id: alerta._id, nivel: alerta.nivel, tipo: alerta.tipo, titulo: alerta.titulo }
        : null,
    })
  } catch (err) {
    console.error('Error en forceScenario:', err)
    return res.status(500).json({ error: 'Error al forzar el escenario' })
  }
}

/**
 * POST /api/dev/reset/:miembroId  (dev only, protegida)
 * Devuelve al miembro a estado verde y limpia sus alertas activas.
 */
async function resetMember(req, res) {
  try {
    const miembro = await miembroDeLaFamilia(req.params.miembroId, req.user.familiaId)
    if (!miembro) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }

    const familia = await Family.findById(miembro.familiaId)
    const altitud = familia?.ubicacion?.altitudMetros || 0

    // Lectura verde fresca, para que los signos vitales también queden estables.
    const ahora = new Date()
    const lectura = generarLecturaObjetivo(miembro, ahora, 'verde', altitud)
    await VitalSign.create({ miembroId: miembro._id, timestamp: ahora, ...lectura })

    // Volver al estado verde.
    miembro.estadoActual = 'verde'
    miembro.mensajeEstado = mensajeEstado('verde', lectura)
    await miembro.save()

    // Limpiar las alertas activas (no leídas) del miembro.
    const { deletedCount } = await Alert.deleteMany({
      miembroId: miembro._id,
      leida: false,
    })

    return res.status(200).json({
      miembroId: miembro._id,
      estadoActual: 'verde',
      alertasEliminadas: deletedCount,
    })
  } catch (err) {
    console.error('Error en resetMember:', err)
    return res.status(500).json({ error: 'Error al resetear el miembro' })
  }
}

module.exports = { forceScenario, resetMember }
