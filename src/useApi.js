import { useEffect, useState } from 'react'
import { api } from './api'

/**
 * Hook para peticiones GET con estados de carga / error.
 * @param {string|null} path  ruta a pedir; null para no pedir nada
 * @param {Array} deps        dependencias que disparan un re-fetch
 * @returns {{ loading, error, data, reload }}
 */
export function useApi(path, deps = []) {
  const [estado, setEstado] = useState({ loading: true, error: null, data: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!path) {
      setEstado({ loading: false, error: null, data: null })
      return
    }
    let vivo = true
    setEstado({ loading: true, error: null, data: null })
    api(path)
      .then((data) => vivo && setEstado({ loading: false, error: null, data }))
      .catch((err) => vivo && setEstado({ loading: false, error: err.message, data: null }))
    return () => {
      vivo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps])

  return { ...estado, reload: () => setTick((t) => t + 1) }
}
