/**
 * vitalsSimulator.js — Generador de lecturas de signos vitales.
 * Reemplaza a los wearables reales mientras no hay hardware.
 *
 * El perfil fisiológico depende de la EDAD (niño / adulto / adulto mayor).
 * La "banda" (verde / ámbar / rojo) depende del ESTADO BASE del miembro:
 *   - verde  → siempre verde
 *   - ambar  → ~40% de las rondas todo verde, el resto 1-2 métricas en ámbar
 *              (oscila verde/ámbar de forma visible, nunca rojo)
 *   - rojo   → 1 métrica en rojo + alguna en ámbar
 * Así Papá (verde) nunca pasa a rojo de la nada y la Abuela (ámbar) oscila.
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min, max, decimales = 1) {
  const v = Math.random() * (max - min) + min
  return Number(v.toFixed(decimales))
}

// Devuelve `cuantas` métricas distintas elegidas al azar.
function metricasAleatorias(metricas, cuantas) {
  return [...metricas].sort(() => Math.random() - 0.5).slice(0, cuantas)
}

function perfilEdad(edad) {
  if (edad < 12) return 'nino'
  if (edad >= 60) return 'mayor'
  return 'adulto'
}

const METRICAS = ['saturacion', 'frecuencia', 'presion', 'sueno']

// Rangos [min, max] por métrica, grupo de edad y banda.
// La presión guarda [[rangoSistólica], [rangoDiastólica]].
const RANGOS = {
  saturacion: {
    // Calibrado para altura > 2400 m (igual para todas las edades).
    verde: [92, 97],
    ambar: [88, 91],
    rojo: [85, 87],
  },
  frecuencia: {
    nino: { verde: [80, 114], ambar: [122, 129], rojo: [132, 140] },
    adulto: { verde: [62, 96], ambar: [102, 109], rojo: [112, 118] },
    mayor: { verde: [62, 94], ambar: [102, 109], rojo: [112, 118] },
  },
  presion: {
    nino: { verde: [[98, 110], [62, 72]], ambar: [[122, 134], [82, 87]], rojo: [[142, 150], [92, 96]] },
    adulto: { verde: [[110, 118], [70, 78]], ambar: [[122, 136], [82, 88]], rojo: [[142, 152], [92, 97]] },
    mayor: { verde: [[112, 119], [72, 79]], ambar: [[123, 137], [83, 88]], rojo: [[143, 153], [92, 97]] },
  },
  sueno: {
    nino: { verde: [9.0, 9.9], ambar: [7.4, 8.7], rojo: [5.5, 6.8] },
    adulto: { verde: [7.2, 8.5], ambar: [5.2, 6.8], rojo: [3.8, 4.8] },
    mayor: { verde: [6.2, 7.6], ambar: [4.7, 5.8], rojo: [3.4, 4.3] },
  },
}

// Asigna una banda a cada métrica según el estado base del miembro.
function bandasParaMiembro(estadoBase) {
  const bandas = { saturacion: 'verde', frecuencia: 'verde', presion: 'verde', sueno: 'verde' }

  if (estadoBase === 'verde') return bandas

  if (estadoBase === 'ambar') {
    if (Math.random() < 0.4) return bandas // ronda completamente verde
    const cuantas = Math.random() < 0.6 ? 1 : 2
    for (const m of metricasAleatorias(METRICAS, cuantas)) bandas[m] = 'ambar'
    return bandas
  }

  // rojo: una métrica en rojo y otra en ámbar
  const elegidas = metricasAleatorias(METRICAS, 2)
  bandas[elegidas[0]] = 'rojo'
  bandas[elegidas[1]] = 'ambar'
  return bandas
}

/**
 * Genera una lectura realista para un miembro.
 * @param {object} miembro      documento FamilyMember (usa edad y estadoActual)
 * @param {Date}   fechaHora    momento de la lectura (no se guarda aquí)
 * @param {string} estadoBase   estado base a respetar; por defecto el del miembro
 */
function generarLectura(miembro, fechaHora = new Date(), estadoBase) {
  const base = estadoBase || miembro.estadoActual || 'verde'
  const perfil = perfilEdad(miembro.edad)
  const bandas = bandasParaMiembro(base)

  const [presSis, presDia] = RANGOS.presion[perfil][bandas.presion]

  return {
    saturacionO2: randInt(...RANGOS.saturacion[bandas.saturacion]),
    frecuenciaCardiaca: randInt(...RANGOS.frecuencia[perfil][bandas.frecuencia]),
    presionSistolica: randInt(...presSis),
    presionDiastolica: randInt(...presDia),
    horasSueno: randFloat(...RANGOS.sueno[perfil][bandas.sueno]),
  }
}

module.exports = { generarLectura, perfilEdad }
