// Helpers de presentación: mapean el estado del backend (verde/ambar/rojo)
// a las clases CSS, etiquetas y emojis del prototipo.

export const clsEstado = (e) => (e === 'rojo' ? 'r' : e === 'ambar' ? 'a' : 'v')

export const ringClass = (e) => (e === 'rojo' ? 'rojo' : e === 'ambar' ? 'ambar' : '')

export const badgeClass = (e) =>
  e === 'rojo' ? 'badge-danger' : e === 'ambar' ? 'badge-watch' : 'badge-ok'

export const tagEstado = (e) =>
  e === 'rojo' ? 'Rojo · actuar' : e === 'ambar' ? 'Ámbar · observar' : 'Verde'

export const labelEstado = (e) =>
  e === 'rojo' ? 'Actuar' : e === 'ambar' ? 'Observar' : 'Todo bien'

export const ringEmoji = (e) => (e === 'rojo' ? '⚠️' : e === 'ambar' ? '🟡' : '🫁')

// Color (variable CSS) para los puntos del historial.
export const colorHist = (c) =>
  ({
    verde: 'var(--green-mid)',
    ambar: 'var(--amber-mid)',
    rojo: 'var(--red-mid)',
    azul: 'var(--nova-mid)',
  })[c] || 'var(--nova-mid)'

// Iniciales a partir del nombre completo, ej. "Pedro Torrico" → "PT".
export function iniciales(nombre) {
  if (!nombre) return '–'
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

// "recién", "hace 3 min", "hace 2 h"… a partir de una fecha ISO.
export function haceCuanto(fecha) {
  if (!fecha) return ''
  const min = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}
