/**
 * historyController.js — Historial de un miembro (pantalla 6).
 */
const HistoryEvent = require('../models/HistoryEvent')
const { miembroDeLaFamilia } = require('../utils/familyGuard')

const DIAS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
]
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

function capitalizar(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Fecha sin hora (medianoche local), para comparar días.
function soloFecha(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// Diferencia en días enteros entre dos fechas (a - b).
function diffDias(a, b) {
  return Math.round((soloFecha(a) - soloFecha(b)) / 86400000)
}

// Etiqueta de un día: "HOY · Martes 19 mayo", "AYER · ...", o "Domingo 17 mayo".
function etiquetaDia(fecha, hoy) {
  const d = diffDias(hoy, fecha)
  const texto = `${capitalizar(DIAS[fecha.getDay()])} ${fecha.getDate()} ${
    MESES[fecha.getMonth()]
  }`
  if (d === 0) return `HOY · ${texto}`
  if (d === 1) return `AYER · ${texto}`
  return texto
}

/**
 * GET /api/history/:miembroId?tab=eventos|metricas|reportes  (protegida)
 */
async function getHistory(req, res) {
  try {
    const miembro = await miembroDeLaFamilia(req.params.miembroId, req.user.familiaId)
    if (!miembro) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }

    const tab = req.query.tab || 'eventos'

    if (tab === 'metricas' || tab === 'reportes') {
      return res.status(200).json({
        tab,
        disponible: false,
        mensaje: 'Esta sección estará disponible próximamente.',
      })
    }

    if (tab !== 'eventos') {
      return res.status(400).json({ error: 'Pestaña no válida' })
    }

    // Eventos del miembro, del más reciente al más antiguo.
    const eventos = await HistoryEvent.find({ miembroId: miembro._id }).sort({
      fechaEvento: -1,
    })

    // Agrupar por día conservando el orden (Map mantiene el orden de inserción).
    const hoy = new Date()
    const grupos = new Map()
    for (const ev of eventos) {
      const fecha = new Date(ev.fechaEvento)
      const etiqueta = etiquetaDia(fecha, hoy)
      if (!grupos.has(etiqueta)) grupos.set(etiqueta, [])
      grupos.get(etiqueta).push({
        color: ev.color,
        texto: ev.texto,
        hora: ev.horaTexto,
      })
    }

    const dias = [...grupos.entries()].map(([fecha, ev]) => ({
      fecha,
      eventos: ev,
    }))

    return res.status(200).json({ miembroId: miembro._id, tab, dias })
  } catch (err) {
    console.error('Error en getHistory:', err)
    return res.status(500).json({ error: 'Error al obtener el historial' })
  }
}

/**
 * GET /api/history/:miembroId/weekly-report  (protegida)
 * Metadata del reporte semanal (la semana anterior completa, lunes a domingo).
 */
async function getWeeklyReport(req, res) {
  try {
    const miembro = await miembroDeLaFamilia(req.params.miembroId, req.user.familiaId)
    if (!miembro) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }

    // Lunes de esta semana → retroceder 7 días → semana anterior completa.
    const hoy = soloFecha(new Date())
    const diasDesdeLunes = (hoy.getDay() + 6) % 7
    const lunesAnterior = new Date(hoy)
    lunesAnterior.setDate(hoy.getDate() - diasDesdeLunes - 7)
    const domingoAnterior = new Date(lunesAnterior)
    domingoAnterior.setDate(lunesAnterior.getDate() + 6)

    let semana
    if (lunesAnterior.getMonth() === domingoAnterior.getMonth()) {
      semana = `Semana del ${lunesAnterior.getDate()} al ${domingoAnterior.getDate()} de ${
        MESES[domingoAnterior.getMonth()]
      }`
    } else {
      semana =
        `Semana del ${lunesAnterior.getDate()} de ${MESES[lunesAnterior.getMonth()]} ` +
        `al ${domingoAnterior.getDate()} de ${MESES[domingoAnterior.getMonth()]}`
    }

    return res.status(200).json({
      semana,
      disponible: true,
      pdfUrl: null, // placeholder: aún no generamos el PDF
    })
  } catch (err) {
    console.error('Error en getWeeklyReport:', err)
    return res.status(500).json({ error: 'Error al obtener el reporte semanal' })
  }
}

module.exports = { getHistory, getWeeklyReport }
