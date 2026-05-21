const Family = require('../models/Family')
const FamilyMember = require('../models/FamilyMember')
require('../models/Device') // registra el modelo para populate('dispositivoId')

// Texto fijo del contexto andino (por ahora no es dinámico).
const MENSAJE_CONTEXTO =
  'Semana seca en Cochabamba. La saturación puede bajar 1–2 puntos. Es completamente normal.'

// Ranking de severidad para calcular el "peor" estado de la familia.
const SEVERIDAD = { verde: 0, ambar: 1, rojo: 2 }

// Saludo según la hora del servidor.
function saludoPorHora(fecha = new Date()) {
  const h = fecha.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// Mensaje general del dashboard según el estado peor de la familia.
function mensajeGeneral(estado) {
  if (estado === 'rojo') {
    return 'Un familiar necesita atención ahora. Revisa la alerta cuanto antes.'
  }
  if (estado === 'ambar') {
    return 'Hay un familiar que conviene observar hoy. Revisa su tarjeta para más detalle.'
  }
  return 'Todos los signos vitales están estables. No hay nada que observar por ahora.'
}

// Mapea un FamilyMember al formato que consume la pantalla 2.
function miembroDashboard(m) {
  return {
    id: m._id,
    nombre: m.nombre,
    apodo: m.apodo,
    edad: m.edad,
    estado: m.estadoActual,
    mensajeEstado: m.mensajeEstado,
    iniciales: m.iniciales,
  }
}

/**
 * GET /api/family/dashboard  (protegida)
 * Endpoint principal de la pantalla 2 (Inicio).
 */
async function getDashboard(req, res) {
  try {
    const familia = await Family.findById(req.user.familiaId)
    if (!familia) {
      return res.status(404).json({ error: 'Familia no encontrada' })
    }

    const miembros = await FamilyMember.find({ familiaId: familia._id })

    // Estado general = el peor estado entre todos los miembros.
    let estadoGeneral = 'verde'
    for (const m of miembros) {
      if (SEVERIDAD[m.estadoActual] > SEVERIDAD[estadoGeneral]) {
        estadoGeneral = m.estadoActual
      }
    }

    // Avisos: enfermera (si hay alguien a observar) + contexto andino fijo.
    const avisos = []
    const aObservar = miembros.find((m) => m.estadoActual !== 'verde')
    if (aObservar) {
      avisos.push({
        tipo: 'enfermera',
        titulo: 'Aviso de enfermera',
        mensaje: `¿Revisamos juntos el informe de ${aObservar.apodo}? Puede responder cuando quiera.`,
      })
    }
    avisos.push({
      tipo: 'contexto',
      titulo: 'Contexto andino',
      mensaje: MENSAJE_CONTEXTO,
    })

    return res.status(200).json({
      saludo: `${saludoPorHora()}, familia ${familia.nombre}`,
      estadoGeneral,
      mensajeGeneral: mensajeGeneral(estadoGeneral),
      miembros: miembros.map(miembroDashboard),
      avisos,
    })
  } catch (err) {
    console.error('Error en getDashboard:', err)
    return res.status(500).json({ error: 'Error al obtener el dashboard' })
  }
}

/**
 * GET /api/family/members  (protegida)
 * Lista los miembros de la familia del usuario.
 */
async function getMembers(req, res) {
  try {
    const miembros = await FamilyMember.find({ familiaId: req.user.familiaId })
    return res.status(200).json({ miembros })
  } catch (err) {
    console.error('Error en getMembers:', err)
    return res.status(500).json({ error: 'Error al obtener los miembros' })
  }
}

/**
 * GET /api/family/members/:id  (protegida)
 * Un miembro específico con sus datos completos.
 */
async function getMember(req, res) {
  try {
    const miembro = await FamilyMember.findById(req.params.id).populate('dispositivoId')

    if (!miembro) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }

    // El miembro debe pertenecer a la familia del usuario autenticado.
    if (String(miembro.familiaId) !== String(req.user.familiaId)) {
      return res.status(404).json({ error: 'Miembro no encontrado' })
    }

    return res.status(200).json({ miembro })
  } catch (err) {
    console.error('Error en getMember:', err)
    return res.status(500).json({ error: 'Error al obtener el miembro' })
  }
}

module.exports = { getDashboard, getMembers, getMember }
