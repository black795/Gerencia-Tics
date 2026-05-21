/**
 * alertEngine.js — Motor de alertas de NOVA.
 *
 * Decide cuándo una lectura interpretada debe convertirse en una Alert.
 * Reglas:
 *   - Una lectura ROJA genera alerta de inmediato.
 *   - Una lectura ÁMBAR genera alerta sólo si es PERSISTENTE: las últimas
 *     3 lecturas consecutivas del miembro están todas en ámbar o rojo.
 *
 * Al generar una alerta también:
 *   - crea un HistoryEvent del color correspondiente,
 *   - actualiza estadoActual del miembro,
 *   - loguea en consola (rojo de forma destacada).
 */
const Alert = require('../models/Alert')
const HistoryEvent = require('../models/HistoryEvent')
const VitalSign = require('../models/VitalSign')
const {
  interpretarSaturacion,
  interpretarFrecuencia,
  interpretarPresion,
  interpretarSueno,
  peorEstado,
  SEVERIDAD,
} = require('./healthRules')

// Lecturas consecutivas no verdes necesarias para considerar el ámbar persistente.
const LECTURAS_PERSISTENCIA = 3

// Contenido del aviso según la métrica que dispara la alerta.
const CONTENIDO = {
  saturacion: {
    tipo: 'saturacion_baja',
    titulo: 'Saturación de oxígeno baja',
    mensaje: (apodo, v) =>
      `La saturación de ${apodo} bajó a ${v}%, por debajo de lo esperado para la altura.`,
    loQueVemos:
      'La saturación bajó de forma constante durante los últimos 40 minutos. ' +
      'No es una caída puntual: la tendencia se mantiene.',
    mientrasEsperan:
      'Siéntala incorporada, afloja la ropa ajustada y ventila la habitación. ' +
      'Mantén la calma y acompáñala respirando despacio con ella.',
  },
  frecuencia: {
    tipo: 'frecuencia_alta',
    titulo: 'Frecuencia cardíaca elevada',
    mensaje: (apodo, v) =>
      `La frecuencia cardíaca de ${apodo} se mantiene en ${v} bpm en reposo.`,
    loQueVemos:
      'La frecuencia cardíaca se mantuvo elevada en reposo durante varias lecturas ' +
      'seguidas, sin actividad física que lo explique.',
    mientrasEsperan:
      'Pídele que se siente y descanse. Evita esfuerzos, cafeína y emociones fuertes, ' +
      'y acompáñala hasta que la frecuencia se normalice.',
  },
  presion: {
    tipo: 'presion_alta',
    titulo: 'Presión arterial elevada',
    mensaje: (apodo, v) =>
      `La presión arterial de ${apodo} está en ${v}, por encima de su rango habitual.`,
    loQueVemos:
      'La presión arterial se mantuvo elevada en lecturas consecutivas, alejada ' +
      'de su rango habitual.',
    mientrasEsperan:
      'Pídele que se siente y descanse en un lugar tranquilo. Evita la sal y los ' +
      'esfuerzos, y no le des medicación sin indicación médica.',
  },
  sueno: {
    tipo: 'sueno_irregular',
    titulo: 'Sueño insuficiente',
    mensaje: (apodo, v) =>
      `${apodo} durmió sólo ${v} h anoche, muy por debajo de lo recomendado.`,
    loQueVemos:
      'El descanso nocturno estuvo muy por debajo de lo recomendado durante varias ' +
      'noches seguidas.',
    mientrasEsperan:
      'Procura un ambiente tranquilo y sin pantallas antes de dormir. Una rutina de ' +
      'descanso regular y algo de luz natural durante el día ayudan.',
  },
}

// Interpreta una lectura cruda → estados por métrica + estado global.
function interpretarLectura(lectura, miembro, altitud) {
  const sat = interpretarSaturacion(lectura.saturacionO2, miembro.edad, altitud)
  const fc = interpretarFrecuencia(lectura.frecuenciaCardiaca, miembro.edad)
  const pres = interpretarPresion(
    lectura.presionSistolica,
    lectura.presionDiastolica,
    miembro.edad,
  )
  const sue = interpretarSueno(lectura.horasSueno, miembro.edad)
  return {
    sat,
    fc,
    pres,
    sue,
    global: peorEstado(sat.estado, fc.estado, pres.estado, sue.estado),
  }
}

// Métrica con peor estado de la lectura (saturación tiene prioridad en empates).
function metricaDominante(interp, lectura) {
  const candidatos = [
    { clave: 'saturacion', estado: interp.sat.estado, valor: lectura.saturacionO2 },
    { clave: 'frecuencia', estado: interp.fc.estado, valor: lectura.frecuenciaCardiaca },
    {
      clave: 'presion',
      estado: interp.pres.estado,
      valor: `${lectura.presionSistolica}/${lectura.presionDiastolica}`,
    },
    { clave: 'sueno', estado: interp.sue.estado, valor: lectura.horasSueno },
  ]
  return candidatos.reduce((peor, c) =>
    SEVERIDAD[c.estado] > SEVERIDAD[peor.estado] ? c : peor,
  )
}

// "HH:MM" local de una fecha.
function horaTexto(fecha) {
  return new Date(fecha).toTimeString().slice(0, 5)
}

/**
 * Evalúa al miembro a partir de sus últimas lecturas y, si corresponde,
 * crea una Alert + HistoryEvent y actualiza su estadoActual.
 *
 * @param {object} miembro  documento FamilyMember (se guarda si cambia el estado)
 * @param {object} familia  documento Family (para la altitud)
 * @returns {Promise<object|null>}  la Alert creada, o null si no procede
 */
async function crearAlertaSiCorresponde(miembro, familia) {
  const altitud = familia?.ubicacion?.altitudMetros || 0

  // Últimas N lecturas, de la más reciente a la más antigua.
  const lecturas = await VitalSign.find({ miembroId: miembro._id })
    .sort({ timestamp: -1 })
    .limit(LECTURAS_PERSISTENCIA)
  if (lecturas.length === 0) return null

  const interpUltima = interpretarLectura(lecturas[0], miembro, altitud)
  const estadoGlobal = interpUltima.global
  if (estadoGlobal === 'verde') return null

  // ─── Decidir el nivel de la alerta ───
  let nivel
  if (estadoGlobal === 'rojo') {
    nivel = 'rojo'
  } else {
    // Ámbar: sólo si las últimas 3 lecturas seguidas no son verdes.
    const persistente =
      lecturas.length >= LECTURAS_PERSISTENCIA &&
      lecturas.every((l) => interpretarLectura(l, miembro, altitud).global !== 'verde')
    if (!persistente) return null
    nivel = 'ambar'
  }

  const dom = metricaDominante(interpUltima, lecturas[0])
  const plantilla = CONTENIDO[dom.clave]

  // Evitar duplicados: no repetir una alerta idéntica aún no leída.
  const ultima = await Alert.findOne({ miembroId: miembro._id }).sort({ createdAt: -1 })
  if (
    ultima &&
    !ultima.leida &&
    ultima.nivel === nivel &&
    ultima.tipo === plantilla.tipo
  ) {
    return null
  }

  const detectadoEn = lecturas[0].timestamp || new Date()
  const apodo = miembro.apodo || miembro.nombre
  const mensaje = plantilla.mensaje(apodo, dom.valor)

  const alerta = await Alert.create({
    miembroId: miembro._id,
    familiaId: miembro.familiaId,
    nivel,
    tipo: plantilla.tipo,
    titulo: plantilla.titulo,
    mensaje,
    detectadoEn,
    leida: false,
    loQueVemos: plantilla.loQueVemos,
    mientrasEsperan: plantilla.mientrasEsperan,
  })

  await HistoryEvent.create({
    miembroId: miembro._id,
    tipo: 'alerta',
    color: nivel,
    texto: `${plantilla.titulo} · ${mensaje}`,
    horaTexto: horaTexto(detectadoEn),
    fechaEvento: detectadoEn,
  })

  // Actualizar el estado actual del miembro.
  if (miembro.estadoActual !== estadoGlobal) {
    miembro.estadoActual = estadoGlobal
    await miembro.save()
  }

  if (nivel === 'rojo') {
    console.log(`🚨 ALERTA ROJA generada para ${miembro.nombre}`)
  } else {
    console.log(`⚠️  Alerta ámbar persistente generada para ${miembro.nombre}`)
  }

  return alerta
}

module.exports = { crearAlertaSiCorresponde, interpretarLectura }
