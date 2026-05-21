// Cliente HTTP de la API NOVA.
// Todas las llamadas pasan por /api, que Vite reenvía al backend (ver vite.config.js).

const TOKEN_KEY = 'nova_token'
const USER_KEY = 'nova_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Llama a la API. Inyecta el token, serializa el body y normaliza errores.
 * @param {string} path  ruta relativa, ej: '/family/dashboard'
 * @param {object} opts  { method, body }
 */
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token

  const res = await fetch('/api' + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    // Token expirado o inválido → cerrar sesión y volver al login.
    if (res.status === 401 && token) {
      clearSession()
      window.location.reload()
    }
    const error = new Error((data && data.error) || 'No se pudo conectar con el servidor')
    error.status = res.status
    throw error
  }

  return data
}
