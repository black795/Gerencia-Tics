/**
 * healthRules.js — Inteligencia "Edge AI" de NOVA.
 * Reglas de interpretación de signos vitales calibradas para la altura andina.
 * Cada función devuelve { estado: 'verde'|'ambar'|'rojo', badge: '...' }.
 */

// Saturación de O₂. Por encima de 2400 m los rangos se ajustan a la altura.
function interpretarSaturacion(valor, edad, altitudMetros) {
  const enAltura = altitudMetros > 2400

  if (enAltura) {
    if (valor >= 92) return { estado: 'verde', badge: 'Normal en altura' }
    if (valor >= 88) return { estado: 'ambar', badge: 'Observar' }
    return { estado: 'rojo', badge: 'Atención' }
  }

  if (valor >= 95) return { estado: 'verde', badge: 'Normal' }
  if (valor >= 90) return { estado: 'ambar', badge: 'Observar' }
  return { estado: 'rojo', badge: 'Atención' }
}

// Frecuencia cardíaca en reposo.
function interpretarFrecuencia(bpm, edad) {
  const esNino = edad < 12

  if (esNino) {
    if (bpm >= 70 && bpm <= 120) return { estado: 'verde', badge: 'Estable' }
    if ((bpm >= 60 && bpm < 70) || (bpm > 120 && bpm <= 130)) {
      return { estado: 'ambar', badge: 'Observar' }
    }
    return { estado: 'rojo', badge: 'Atención' }
  }

  // Adulto
  if (bpm >= 60 && bpm <= 100) return { estado: 'verde', badge: 'Estable' }
  if ((bpm >= 50 && bpm <= 59) || (bpm >= 101 && bpm <= 110)) {
    return { estado: 'ambar', badge: 'Observar' }
  }
  return { estado: 'rojo', badge: 'Atención' }
}

// Presión arterial.
function interpretarPresion(sistolica, diastolica, edad) {
  if (sistolica >= 140 || diastolica >= 90) return { estado: 'rojo', badge: 'Atención' }
  if (sistolica >= 120 || diastolica >= 80) return { estado: 'ambar', badge: 'Observar' }
  return { estado: 'verde', badge: 'Normal' }
}

// Horas de sueño. (Identificador sin "ñ" para evitar problemas de codificación.)
function interpretarSueno(horas, edad) {
  const esNino = edad < 12
  const esAdultoMayor = edad >= 60

  if (esNino) {
    if (horas >= 9) return { estado: 'verde', badge: 'Durmió bien' }
    if (horas >= 7) return { estado: 'ambar', badge: 'Sueño irregular' }
    return { estado: 'rojo', badge: 'Durmió poco' }
  }

  if (esAdultoMayor) {
    if (horas >= 6) return { estado: 'verde', badge: 'Durmió bien' }
    if (horas >= 4.5) return { estado: 'ambar', badge: 'Sueño irregular' }
    return { estado: 'rojo', badge: 'Durmió poco' }
  }

  // Adulto
  if (horas >= 7) return { estado: 'verde', badge: 'Durmió bien' }
  if (horas >= 5) return { estado: 'ambar', badge: 'Sueño irregular' }
  return { estado: 'rojo', badge: 'Durmió poco' }
}

// Severidad relativa de los estados, para combinar varias lecturas.
const SEVERIDAD = { verde: 0, ambar: 1, rojo: 2 }

// Devuelve el peor estado de una lista.
function peorEstado(...estados) {
  return estados.reduce(
    (peor, e) => (SEVERIDAD[e] > SEVERIDAD[peor] ? e : peor),
    'verde',
  )
}

module.exports = {
  interpretarSaturacion,
  interpretarFrecuencia,
  interpretarPresion,
  interpretarSueno,
  peorEstado,
  SEVERIDAD,
}
