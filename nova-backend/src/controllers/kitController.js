/**
 * kitController.js — Kit familiar NOVA (pantalla 8).
 *
 * El Kit es un complemento de hardware. Sólo pueden pedirlo los usuarios
 * con 30+ días activos (antigüedad de su cuenta).
 */
const User = require('../models/User')
const KitOrder = require('../models/KitOrder')

// Días de antigüedad requeridos para pedir el Kit.
const DIAS_REQUERIDOS = 30

// Precio del Kit (pago único).
const MONTO_KIT = 280

// Información estática del Kit (estructura exacta de la pantalla 8).
const KIT_INFO = {
  precio: { monto: 280, moneda: 'Bs', tipo: 'único' },
  suscripcion: { monto: 45, moneda: 'Bs', periodo: 'mes', incluida: true },
  componentes: [
    {
      icono: 'droplet',
      nombre: 'Oxímetro calibrado para altura',
      descripcion: 'Ajustado para 2.500+ m. Evita falsas alarmas.',
    },
    {
      icono: 'wind',
      nombre: 'Sensor ambiental de dormitorio',
      descripcion: 'Temperatura, humedad y CO₂ en tiempo real.',
    },
    {
      icono: 'bulb',
      nombre: 'Módulo de iluminación inteligente',
      descripcion: 'La luz del cuarto cambia según el estado. Sin ruido.',
    },
  ],
  beneficios: [
    {
      titulo: 'Calibración andina real',
      descripcion:
        'Diferencia hipoxia de altura de una emergencia. Reduce falsas alarmas en un 60%.',
    },
    {
      titulo: 'Avisa sin despertar',
      descripcion:
        'La luz cambia suavemente. Toda la familia entiende sin alarmas ni notificaciones ruidosas.',
    },
  ],
  requisito: 'Solo para usuarios con 30+ días activos',
}

// Días enteros transcurridos desde una fecha hasta hoy.
function diasDesde(fecha) {
  if (!fecha) return 0
  return Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000)
}

/**
 * GET /api/kit/info  (público)
 * Estructura completa de la pantalla 8.
 */
function getKitInfo(req, res) {
  return res.status(200).json(KIT_INFO)
}

/**
 * GET /api/kit/eligibility  (protegida)
 * Comprueba si el usuario lleva 30+ días activo.
 */
async function checkEligibility(req, res) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const diasActivos = diasDesde(user.createdAt)
    const elegible = diasActivos >= DIAS_REQUERIDOS

    const mensaje = elegible
      ? 'Tu familia ya puede pedir el Kit familiar NOVA.'
      : `Te faltan ${DIAS_REQUERIDOS - diasActivos} días para poder pedir el Kit familiar.`

    return res.status(200).json({ elegible, diasActivos, mensaje })
  } catch (err) {
    console.error('Error en checkEligibility:', err)
    return res.status(500).json({ error: 'Error al verificar la elegibilidad' })
  }
}

/**
 * POST /api/kit/request  (protegida)
 * Body: { direccionEnvio, telefono }
 * Crea un KitOrder en estado "pendiente". No procesa pago todavía.
 */
async function requestKit(req, res) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const diasActivos = diasDesde(user.createdAt)
    if (diasActivos < DIAS_REQUERIDOS) {
      return res.status(403).json({
        error: 'Aún no puedes pedir el Kit familiar.',
        diasActivos,
        requisito: `Necesitas ${DIAS_REQUERIDOS}+ días activos.`,
      })
    }

    const { direccionEnvio, telefono } = req.body || {}
    if (!direccionEnvio || !direccionEnvio.trim()) {
      return res.status(400).json({ error: 'La dirección de envío es obligatoria' })
    }
    if (!telefono || !telefono.trim()) {
      return res.status(400).json({ error: 'El teléfono de contacto es obligatorio' })
    }

    const pedido = await KitOrder.create({
      userId: user._id,
      familiaId: user.familiaId,
      estado: 'pendiente',
      direccionEnvio: direccionEnvio.trim(),
      telefono: telefono.trim(),
      montoTotal: MONTO_KIT,
      fechaPedido: new Date(),
    })

    return res.status(201).json({
      mensaje: 'Pedido registrado. Te contactaremos para confirmar el envío.',
      pedido,
    })
  } catch (err) {
    console.error('Error en requestKit:', err)
    return res.status(500).json({ error: 'Error al registrar el pedido del Kit' })
  }
}

module.exports = { getKitInfo, checkEligibility, requestKit }
