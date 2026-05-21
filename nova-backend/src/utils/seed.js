/**
 * Seed de datos para NOVA.
 * Limpia las colecciones y carga la familia Torrico tal como aparece
 * en el prototipo HTML (8 pantallas).
 *
 * Uso:  npm run seed
 */
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User = require('../models/User')
const Family = require('../models/Family')
const FamilyMember = require('../models/FamilyMember')
const Device = require('../models/Device')
const VitalSign = require('../models/VitalSign')
const Alert = require('../models/Alert')
const HistoryEvent = require('../models/HistoryEvent')
const Settings = require('../models/Settings')
const Conversation = require('../models/Conversation')
const KitOrder = require('../models/KitOrder')

// "Hoy" del prototipo: martes 19 de mayo de 2026, 9:14
const HOY = new Date(2026, 4, 19, 9, 14, 0)

// Devuelve una fecha desplazada N días respecto de HOY, a la hora indicada.
function dia(offsetDias, hora = 7, min = 0) {
  const d = new Date(HOY)
  d.setDate(d.getDate() + offsetDias)
  d.setHours(hora, min, 0, 0)
  return d
}

// Devuelve una fecha N minutos antes de HOY.
function minutosAntes(min) {
  return new Date(HOY.getTime() - min * 60000)
}

/**
 * Series de signos vitales por miembro · 7 lecturas (una por día).
 * Índice 0 = hace 6 días ... índice 6 = hoy.
 * Los valores de "hoy" de Papá coinciden exactamente con el prototipo
 * (94 %, 68 bpm, 118/76, 6.4 h). El jueves baja la saturación de Papá,
 * tal como muestra la gráfica de 7 días.
 */
const VITALES = {
  papa: {
    o2:    [93, 93, 94, 90, 93, 94, 94],
    fc:    [67, 66, 68, 70, 67, 68, 68],
    sis:   [117, 116, 118, 119, 117, 118, 118],
    dia:   [75, 74, 76, 77, 76, 75, 76],
    sueno: [6.6, 6.2, 6.8, 6.0, 6.5, 6.7, 6.4],
  },
  abuela: {
    o2:    [92, 93, 92, 91, 93, 92, 92],
    fc:    [74, 76, 75, 78, 74, 88, 84],
    sis:   [126, 125, 127, 126, 124, 128, 127],
    dia:   [81, 80, 82, 81, 80, 82, 82],
    sueno: [6.9, 7.0, 6.6, 5.9, 7.2, 5.2, 4.8],
  },
  sofia: {
    o2:    [97, 97, 96, 98, 97, 97, 97],
    fc:    [90, 88, 91, 89, 90, 92, 90],
    sis:   [101, 100, 102, 101, 100, 101, 101],
    dia:   [65, 64, 66, 65, 64, 66, 65],
    sueno: [8.0, 8.2, 7.8, 8.4, 8.1, 7.9, 7.6],
  },
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB conectado · iniciando seed...')

  // 1. Limpiar todas las colecciones
  await Promise.all([
    User.deleteMany({}),
    Family.deleteMany({}),
    FamilyMember.deleteMany({}),
    Device.deleteMany({}),
    VitalSign.deleteMany({}),
    Alert.deleteMany({}),
    HistoryEvent.deleteMany({}),
    Settings.deleteMany({}),
    Conversation.deleteMany({}),
    KitOrder.deleteMany({}),
  ])
  console.log('Colecciones limpiadas')

  // 2. Familia Torrico
  const familia = await Family.create({
    nombre: 'Torrico',
    ubicacion: { ciudad: 'Cochabamba', altitudMetros: 2558 },
  })

  // 3. Usuario administrador
  const passwordHash = await bcrypt.hash('nova1234', 10)
  const admin = await User.create({
    email: 'alan@nova.bo',
    password: passwordHash,
    nombre: 'Alan',
    apellido: 'Torrico',
    familiaId: familia._id,
    plan: 'familiar',
    planRenovacion: new Date(2026, 5, 19), // 19 jun 2026
  })
  familia.adminUserId = admin._id
  await familia.save()

  // Retrocedemos la fecha de alta del admin 45 días para que el Kit familiar
  // (requiere 30+ días activos) sea elegible en la demo. Usamos el driver
  // nativo porque Mongoose marca createdAt como inmutable.
  await User.collection.updateOne(
    { _id: admin._id },
    { $set: { createdAt: new Date(HOY.getTime() - 45 * 24 * 60 * 60 * 1000) } },
  )

  // 4. Miembros monitoreados
  const papa = await FamilyMember.create({
    familiaId: familia._id,
    nombre: 'Pedro Torrico',
    apodo: 'Papá',
    edad: 61,
    iniciales: 'PT',
    estadoActual: 'verde',
    mensajeEstado: 'Saturación 94% · estable para la altura',
  })
  const abuela = await FamilyMember.create({
    familiaId: familia._id,
    nombre: 'Abuela Torrico',
    apodo: 'Abuela',
    edad: 74,
    iniciales: 'AT',
    estadoActual: 'ambar',
    mensajeEstado: '3 noches con sueño irregular. La revisaremos juntos.',
  })
  const sofia = await FamilyMember.create({
    familiaId: familia._id,
    nombre: 'Sofía Torrico',
    apodo: 'Sofía',
    edad: 8,
    iniciales: 'ST',
    estadoActual: 'verde',
    mensajeEstado: 'Durmió estable · frecuencia normal',
  })

  // 5. Dispositivos
  const miBand = await Device.create({
    familiaId: familia._id,
    miembroId: papa._id,
    tipo: 'mi_band',
    nombre: 'Mi Band 6',
    activo: true,
    ultimoSync: minutosAntes(3), // "Sync 3 min"
  })
  await Device.create({
    familiaId: familia._id,
    tipo: 'apple_watch',
    nombre: 'Apple Watch',
    activo: true,
    ultimoSync: minutosAntes(1), // "Sync 1 min"
  })
  await Device.create({
    familiaId: familia._id,
    tipo: 'oximetro',
    nombre: 'Oxímetro genérico',
    activo: false,
    ultimoSync: dia(0, 7, 42), // "Último dato: 07:42"
  })
  // Mi Band 6 queda vinculado a Papá
  papa.dispositivoId = miBand._id
  await papa.save()

  // 6. Signos vitales · 7 días por miembro
  const miembros = [
    { ref: papa, datos: VITALES.papa },
    { ref: abuela, datos: VITALES.abuela },
    { ref: sofia, datos: VITALES.sofia },
  ]
  const lecturas = []
  for (const { ref, datos } of miembros) {
    for (let i = 0; i < 7; i++) {
      lecturas.push({
        miembroId: ref._id,
        timestamp: dia(i - 6, 7, 0),
        saturacionO2: datos.o2[i],
        frecuenciaCardiaca: datos.fc[i],
        presionSistolica: datos.sis[i],
        presionDiastolica: datos.dia[i],
        horasSueno: datos.sueno[i],
      })
    }
  }
  await VitalSign.insertMany(lecturas)

  // 7. Eventos de historial · pantalla 6 (Abuela)
  await HistoryEvent.insertMany([
    // HOY · Martes 19 mayo
    {
      miembroId: abuela._id,
      tipo: 'sueño',
      color: 'ambar',
      texto: 'Sueño irregular · despertó 2 veces',
      horaTexto: '02:14 y 03:58',
      fechaEvento: dia(0),
    },
    {
      miembroId: abuela._id,
      tipo: 'saturacion',
      color: 'verde',
      texto: 'Saturación estable toda la noche · 91–93%',
      horaTexto: '00:00 — 07:30',
      fechaEvento: dia(0),
    },
    // AYER · Lunes 18 mayo
    {
      miembroId: abuela._id,
      tipo: 'reporte',
      color: 'azul',
      texto: 'Reporte enviado al Dr. Vargas (con permiso)',
      horaTexto: '18:30',
      fechaEvento: dia(-1),
    },
    {
      miembroId: abuela._id,
      tipo: 'frecuencia',
      color: 'ambar',
      texto: 'Frecuencia cardíaca elevada · 88 bpm en reposo',
      horaTexto: '14:00 — 15:30',
      fechaEvento: dia(-1),
    },
    {
      miembroId: abuela._id,
      tipo: 'presion',
      color: 'verde',
      texto: 'Presión 128/82 · normal para su edad',
      horaTexto: '08:15',
      fechaEvento: dia(-1),
    },
    // DOMINGO 17 mayo
    {
      miembroId: abuela._id,
      tipo: 'llamada',
      color: 'azul',
      texto: 'Enfermera NOVA · llamada de seguimiento',
      horaTexto: '10:00 · 8 min',
      fechaEvento: dia(-2),
    },
    {
      miembroId: abuela._id,
      tipo: 'sueño',
      color: 'verde',
      texto: 'Sueño estable · 7.2 h continuas',
      horaTexto: '22:00 — 05:12',
      fechaEvento: dia(-2),
    },
  ])

  // 8. Settings por defecto del usuario admin
  await Settings.create({
    userId: admin._id,
    procesamientoLocal: true,
    compartirConMedico: false,
    alertasWhatsapp: true,
    luzAmbiental: false,
  })

  // Resumen
  console.log('\nSeed completado. Documentos en la base:')
  console.log(`  Familias:        ${await Family.countDocuments()}`)
  console.log(`  Usuarios:        ${await User.countDocuments()}`)
  console.log(`  Miembros:        ${await FamilyMember.countDocuments()}`)
  console.log(`  Dispositivos:    ${await Device.countDocuments()}`)
  console.log(`  Signos vitales:  ${await VitalSign.countDocuments()}`)
  console.log(`  Eventos hist.:   ${await HistoryEvent.countDocuments()}`)
  console.log(`  Settings:        ${await Settings.countDocuments()}`)
  console.log(`  Alertas:         ${await Alert.countDocuments()}`)
}

seed()
  .then(async () => {
    await mongoose.disconnect()
    console.log('\nListo. Conexión cerrada.')
    process.exit(0)
  })
  .catch(async (err) => {
    console.error('\nError en el seed:', err)
    await mongoose.disconnect()
    process.exit(1)
  })
