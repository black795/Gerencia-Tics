const Family = require('../models/Family')
const FamilyMember = require('../models/FamilyMember')
const VitalSign = require('../models/VitalSign')
require('../models/Device') // registra el modelo para populate('dispositivoId')
const {
  interpretarSaturacion,
  interpretarFrecuencia,
  interpretarPresion,
  interpretarSueno,
  peorEstado,
} = require('../utils/healthRules')

// Iniciales y nombres de día (índice = Date.getDay(), 0 = domingo).
const LETRA_DIA = ['D', 'L', 'M', 'Mi', 'J', 'V', 'S']
const NOMBRE_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

// Formatea miles con punto: 2558 → "2.558".
function formatMiles(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Clave de día local (YYYY-M-D) para agrupar lecturas.
function claveDia(fecha) {
  return `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`
}

/**
 * Busca un miembro y valida que pertenezca a la familia del usuario.
 * Devuelve { miembro, familia } o null si no corresponde / no existe.
 */
async function buscarMiembroDeLaFamilia(miembroId, familiaIdUsuario) {
  let miembro
  try {
    miembro = await FamilyMember.findById(miembroId).populate('dispositivoId')
  } catch (err) {
    return null // id con formato inválido
  }
  if (!miembro) return null
  if (String(miembro.familiaId) !== String(familiaIdUsuario)) return null

  const familia = await Family.findById(miembro.familiaId)
  return { miembro, familia }
}

// Comentario de NOVA en lenguaje natural (no clínico).
function comentarioNova(estado, miembro, altitud) {
  if (estado === 'verde') {
    return `Todo dentro de lo esperado para ${miembro.edad} años a ${formatMiles(altitud)} m. Sigamos observando esta semana.`
  }
  if (estado === 'ambar') {
    return `Hay algún valor que conviene observar en ${miembro.apodo} hoy. Nada urgente, pero estemos atentos.`
  }
  return `Algunos signos de ${miembro.apodo} necesitan atención. Conviene revisarlo pronto.`
}

/**
 * GET /api/vitals/:miembroId/current  (protegida)
 * Última lectura del miembro con badges interpretativos.
 */
async function getCurrentVitals(req, res) {
  try {
    const datos = await buscarMiembroDeLaFamilia(req.params.miembroId, req.user.familiaId)
    if (!datos) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }
    const { miembro, familia } = datos
    const altitud = familia?.ubicacion?.altitudMetros || 0

    const lectura = await VitalSign.findOne({ miembroId: miembro._id }).sort({ timestamp: -1 })
    if (!lectura) {
      return res.status(404).json({ error: 'Aún no hay lecturas para este miembro' })
    }

    const sat = interpretarSaturacion(lectura.saturacionO2, miembro.edad, altitud)
    const fc = interpretarFrecuencia(lectura.frecuenciaCardiaca, miembro.edad)
    const pres = interpretarPresion(lectura.presionSistolica, lectura.presionDiastolica, miembro.edad)
    const sue = interpretarSueno(lectura.horasSueno, miembro.edad)
    const estadoGlobal = peorEstado(sat.estado, fc.estado, pres.estado, sue.estado)

    return res.status(200).json({
      miembro: {
        nombre: miembro.nombre,
        apodo: miembro.apodo,
        edad: miembro.edad,
        dispositivo: miembro.dispositivoId ? miembro.dispositivoId.nombre : null,
        ultimoSync: miembro.dispositivoId ? miembro.dispositivoId.ultimoSync : lectura.timestamp,
      },
      lecturas: {
        saturacionO2: {
          valor: lectura.saturacionO2,
          unidad: '%',
          label: 'Saturación O₂',
          badge: sat.badge,
          estado: sat.estado,
        },
        frecuencia: {
          valor: lectura.frecuenciaCardiaca,
          unidad: 'bpm',
          label: 'Frec. cardíaca',
          badge: fc.badge,
          estado: fc.estado,
        },
        sueño: {
          valor: lectura.horasSueno,
          unidad: 'h',
          label: 'Sueño anoche',
          badge: sue.badge,
          estado: sue.estado,
        },
        presion: {
          valor: `${lectura.presionSistolica}/${lectura.presionDiastolica}`,
          unidad: '',
          label: 'Presión arterial',
          badge: pres.badge,
          estado: pres.estado,
        },
      },
      comentarioNova: comentarioNova(estadoGlobal, miembro, altitud),
    })
  } catch (err) {
    console.error('Error en getCurrentVitals:', err)
    return res.status(500).json({ error: 'Error al obtener los signos vitales' })
  }
}

/**
 * GET /api/vitals/:miembroId/range?period=day|week|month  (protegida)
 * Array de los últimos 7 días para el gráfico de barras de saturación.
 */
async function getVitalsRange(req, res) {
  try {
    const datos = await buscarMiembroDeLaFamilia(req.params.miembroId, req.user.familiaId)
    if (!datos) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }
    const { miembro, familia } = datos
    const altitud = familia?.ubicacion?.altitudMetros || 0
    const period = req.query.period || 'week'

    // Lecturas de los últimos ~8 días, en orden ascendente.
    const desde = new Date()
    desde.setDate(desde.getDate() - 8)
    const lecturas = await VitalSign.find({
      miembroId: miembro._id,
      timestamp: { $gte: desde },
    }).sort({ timestamp: 1 })

    // Una entrada por día: la última lectura de cada día.
    const porDia = new Map()
    for (const l of lecturas) {
      porDia.set(claveDia(l.timestamp), l)
    }
    const diasLectura = [...porDia.values()].slice(-7)

    const dataset = diasLectura.map((l, i) => {
      const esUltimo = i === diasLectura.length - 1
      const sat = interpretarSaturacion(l.saturacionO2, miembro.edad, altitud)
      const item = {
        dia: esUltimo ? 'Hoy' : LETRA_DIA[l.timestamp.getDay()],
        fecha: l.timestamp,
        saturacion: l.saturacionO2,
        color: esUltimo ? 'actual' : sat.estado === 'verde' ? 'normal' : sat.estado,
      }
      if (!esUltimo && sat.estado !== 'verde') {
        item.nota = 'Variación leve para la altitud, sin riesgo.'
      }
      return item
    })

    // notaContexto: referencia al día que bajó (si lo hay).
    const diaBajo = dataset.find((d) => d.color === 'ambar' || d.color === 'rojo')
    let notaContexto
    if (diaBajo) {
      const nombre = NOMBRE_DIA[new Date(diaBajo.fecha).getDay()]
      notaContexto = `El ${nombre} bajó por la climatología · variación normal para esta altitud.`
    } else {
      notaContexto = 'Sin variaciones relevantes esta semana · todo estable para la altitud.'
    }

    return res.status(200).json({
      miembroId: miembro._id,
      period,
      datos: dataset,
      notaContexto,
    })
  } catch (err) {
    console.error('Error en getVitalsRange:', err)
    return res.status(500).json({ error: 'Error al obtener el histórico de signos vitales' })
  }
}

module.exports = { getCurrentVitals, getVitalsRange }
