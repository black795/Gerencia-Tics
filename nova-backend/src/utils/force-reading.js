/**
 * force-reading.js — Fuerza manualmente una lectura para un miembro.
 * Útil para el checkpoint de la Fase 5: provoca una lectura baja y verifica
 * que el motor de alertas crea la Alert correspondiente.
 *
 * Uso:  node src/utils/force-reading.js [apodo] [banda]
 *   apodo  apodo del miembro (por defecto "Abuela")
 *   banda  verde | ambar | rojo (por defecto "rojo")
 *
 * Ejemplo:  npm run force            → lectura roja para la Abuela
 *           npm run force -- Papá ambar
 */
require('dotenv').config()
const mongoose = require('mongoose')

const Family = require('../models/Family')
const FamilyMember = require('../models/FamilyMember')
const Device = require('../models/Device')
const VitalSign = require('../models/VitalSign')
const { generarLectura } = require('./vitalsSimulator')
const { crearAlertaSiCorresponde } = require('./alertEngine')

const apodoBuscado = process.argv[2] || 'Abuela'
const banda = process.argv[3] || 'rojo'

async function main() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB conectado · forzando lectura...\n')

  const miembro = await FamilyMember.findOne({
    apodo: new RegExp(`^${apodoBuscado}$`, 'i'),
  })
  if (!miembro) {
    console.error(`No se encontró ningún miembro con apodo "${apodoBuscado}".`)
    await mongoose.disconnect()
    process.exit(1)
  }

  const familia = await Family.findById(miembro.familiaId)
  const ahora = new Date()
  const lectura = generarLectura(miembro, ahora, banda)

  await VitalSign.create({ miembroId: miembro._id, timestamp: ahora, ...lectura })
  if (miembro.dispositivoId) {
    await Device.findByIdAndUpdate(miembro.dispositivoId, { ultimoSync: ahora })
  }

  console.log(`Lectura forzada (banda "${banda}") para ${miembro.nombre}:`)
  console.log(
    `  O₂ ${lectura.saturacionO2}%  FC ${lectura.frecuenciaCardiaca}  ` +
      `PA ${lectura.presionSistolica}/${lectura.presionDiastolica}  ` +
      `sueño ${lectura.horasSueno}h\n`,
  )

  const alerta = await crearAlertaSiCorresponde(miembro, familia)
  if (alerta) {
    console.log(
      `\nAlert creada → id ${alerta._id}  nivel ${alerta.nivel}  tipo ${alerta.tipo}`,
    )
  } else {
    console.log('\nNo se generó alerta (la lectura no cumple las reglas).')
  }

  await mongoose.disconnect()
  console.log('\nListo. Conexión cerrada.')
  process.exit(0)
}

main().catch(async (err) => {
  console.error('Error al forzar la lectura:', err)
  await mongoose.disconnect()
  process.exit(1)
})
