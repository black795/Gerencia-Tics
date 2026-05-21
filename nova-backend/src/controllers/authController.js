const bcrypt = require('bcryptjs')

const User = require('../models/User')
const Family = require('../models/Family')
const Settings = require('../models/Settings')
const { generarToken } = require('../utils/token')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Forma pública del usuario (nunca incluye el password).
function usuarioPublico(user) {
  return {
    id: user._id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    plan: user.plan,
    planRenovacion: user.planRenovacion,
    familiaId: user.familiaId,
  }
}

/**
 * POST /api/auth/register
 * Body: { email, password, nombre, apellido, familiaNombre, ciudad, altitudMetros }
 * Crea User + Family + Settings y devuelve un token JWT.
 */
async function register(req, res) {
  try {
    const {
      email,
      password,
      nombre,
      apellido,
      familiaNombre,
      ciudad,
      altitudMetros,
    } = req.body

    // Validación de inputs
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }
    if (!familiaNombre) {
      return res.status(400).json({ error: 'El nombre de la familia es obligatorio' })
    }

    const emailNormalizado = email.toLowerCase().trim()
    const yaExiste = await User.findOne({ email: emailNormalizado })
    if (yaExiste) {
      return res.status(400).json({ error: 'Ese email ya está registrado' })
    }

    // 1. Familia
    const familia = await Family.create({
      nombre: familiaNombre,
      ubicacion: {
        ciudad: ciudad,
        altitudMetros: altitudMetros,
      },
    })

    // 2. Usuario (password hasheado con bcrypt, 10 rounds)
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      email: emailNormalizado,
      password: passwordHash,
      nombre,
      apellido,
      familiaId: familia._id,
      plan: 'free',
    })

    // El usuario que registra queda como admin de la familia
    familia.adminUserId = user._id
    await familia.save()

    // 3. Settings por defecto
    await Settings.create({ userId: user._id })

    const token = generarToken(user)

    return res.status(201).json({
      token,
      user: usuarioPublico(user),
      family: {
        id: familia._id,
        nombre: familia.nombre,
        ubicacion: familia.ubicacion,
      },
    })
  } catch (err) {
    console.error('Error en register:', err)
    return res.status(500).json({ error: 'Error al registrar el usuario' })
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Verifica con bcrypt y devuelve token + datos básicos de usuario y familia.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const passwordOk = await bcrypt.compare(password, user.password)
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const familia = user.familiaId ? await Family.findById(user.familiaId) : null
    const token = generarToken(user)

    return res.status(200).json({
      token,
      user: usuarioPublico(user),
      family: familia
        ? { id: familia._id, nombre: familia.nombre, ubicacion: familia.ubicacion }
        : null,
    })
  } catch (err) {
    console.error('Error en login:', err)
    return res.status(500).json({ error: 'Error al iniciar sesión' })
  }
}

/**
 * GET /api/auth/me  (protegida)
 * Devuelve los datos del usuario autenticado, sin el password.
 */
async function me(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('familiaId')

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    return res.status(200).json({ user })
  } catch (err) {
    console.error('Error en me:', err)
    return res.status(500).json({ error: 'Error al obtener el usuario' })
  }
}

module.exports = { register, login, me }
