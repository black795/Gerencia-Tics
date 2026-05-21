/**
 * simulator-runner.js — Simulador en vivo de signos vitales.
 * Cada N segundos genera una lectura nueva para cada miembro, la guarda en
 * VitalSign y actualiza estadoActual + mensajeEstado del FamilyMember.
 *
 * Uso:  npm run simulator
 * Intervalo configurable con la variable de entorno SIM_INTERVAL (segundos).
 */
require('dotenv').config()
const mongoose = require('mongoose')

const Family = require('../models/Family')
const FamilyMember = require('../models/FamilyMember')
const Device = require('../models/Device')
const VitalSign = require('../models/VitalSign')
const { generarLectura } = require('./vitalsSimulator')
const { crearAlertaSiCorresponde } = require('./alertEngine')
const {
  interpretarSaturacion,
  interpretarFrecuencia,
  interpretarPresion,
  interpretarSueno,
  peorEstado,
} = require('./healthRules')

const INTERVALO_SEG = Number(process.env.SIM_INTERVAL) || 30

// Estado base de cada miembro, capturado al iniciar el simulador.
// Así un miembro ámbar sigue oscilando aunque su estadoActual cambie a verde.
const estadoBasePorMiembro = new Map()

// Mensaje de estado en lenguaje natural (no clínico) según la lectura.
function construirMensaje(estado, lectura, estados) {
  if (estado === 'verde') {
    return `Saturación ${lectura.saturacionO2}% · estable para la altura`
  }
  if (estados.sat !== 'verde') {
    return `Saturación en ${lectura.saturacionO2}% · conviene observar hoy`
  }
  if (estados.sue !== 'verde') {
    return `Sueño irregular anoche · ${lectura.horasSueno} h. La revisaremos juntos.`
  }
  if (estados.fc !== 'verde') {
    return `Frecuencia cardíaca en ${lectura.frecuenciaCardiaca} bpm · la estamos observando`
  }
  if (estados.pres !== 'verde') {
    return `Presión ${lectura.presionSistolica}/${lectura.presionDiastolica} · la seguimos de cerca`
  }
  return 'Hay algo que conviene observar hoy'
}

// Genera y persiste una lectura para cada miembro.
async function ronda() {
  const miembros = await FamilyMember.find()

  for (const miembro of miembros) {
    const familia = await Family.findById(miembro.familiaId)
    const altitud = familia?.ubicacion?.altitudMetros || 0

    const base = estadoBasePorMiembro.get(String(miembro._id)) || miembro.estadoActual
    const ahora = new Date()
    const lectura = generarLectura(miembro, ahora, base)

    // 1. Guardar la lectura cruda.
    await VitalSign.create({ miembroId: miembro._id, timestamp: ahora, ...lectura })

    // 2. Interpretar y actualizar el estado del miembro.
    const sat = interpretarSaturacion(lectura.saturacionO2, miembro.edad, altitud)
    const fc = interpretarFrecuencia(lectura.frecuenciaCardiaca, miembro.edad)
    const pres = interpretarPresion(lectura.presionSistolica, lectura.presionDiastolica, miembro.edad)
    const sue = interpretarSueno(lectura.horasSueno, miembro.edad)
    const estado = peorEstado(sat.estado, fc.estado, pres.estado, sue.estado)

    miembro.estadoActual = estado
    miembro.mensajeEstado = construirMensaje(estado, lectura, {
      sat: sat.estado,
      fc: fc.estado,
      pres: pres.estado,
      sue: sue.estado,
    })
    await miembro.save()

    // 3. Actualizar el último sync del dispositivo, si tiene uno.
    if (miembro.dispositivoId) {
      await Device.findByIdAndUpdate(miembro.dispositivoId, { ultimoSync: ahora })
    }

    // 4. Evaluar si la lectura debe generar una alerta (rojo o ámbar persistente).
    await crearAlertaSiCorresponde(miembro, familia)

    console.log(
      `   ${miembro.apodo.padEnd(8)} O₂ ${lectura.saturacionO2}%  ` +
        `FC ${lectura.frecuenciaCardiaca}  ` +
        `PA ${lectura.presionSistolica}/${lectura.presionDiastolica}  ` +
        `sueño ${lectura.horasSueno}h  →  ${estado.toUpperCase()}`,
    )
  }
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB conectado · simulador NOVA iniciado')

  // Capturar el estado base de cada miembro.
  const miembros = await FamilyMember.find()
  for (const m of miembros) {
    estadoBasePorMiembro.set(String(m._id), m.estadoActual)
  }
  console.log(
    `Generando lecturas cada ${INTERVALO_SEG}s para ${miembros.length} miembros. ` +
      'Ctrl+C para detener.\n',
  )

  // Primera ronda inmediata.
  console.log(`[${new Date().toLocaleTimeString()}] Ronda inicial:`)
  await ronda()

  const intervalo = setInterval(async () => {
    console.log(`\n[${new Date().toLocaleTimeString()}] Nueva ronda de lecturas:`)
    try {
      await ronda()
    } catch (err) {
      console.error('Error en la ronda:', err.message)
    }
  }, INTERVALO_SEG * 1000)

  // Cierre ordenado con Ctrl+C.
  process.on('SIGINT', async () => {
    clearInterval(intervalo)
    console.log('\nSimulador detenido. Cerrando conexión...')
    await mongoose.disconnect()
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('Error al iniciar el simulador:', err)
  process.exit(1)
})
