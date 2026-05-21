import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El proxy /api evita hardcodear la IP del backend: el navegador siempre
// llama al mismo origen que sirve el frontend (PC o móvil) y Vite reenvía
// la petición al backend en localhost:4000.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expone el dev server en la red local (para probar en el móvil)
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
