require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./src/config/db')

const authRoutes = require('./src/routes/auth')
const familyRoutes = require('./src/routes/family')
const vitalsRoutes = require('./src/routes/vitals')
const alertRoutes = require('./src/routes/alerts')
const historyRoutes = require('./src/routes/history')
const deviceRoutes = require('./src/routes/devices')
const settingsRoutes = require('./src/routes/settings')
const assistantRoutes = require('./src/routes/assistant')
const kitRoutes = require('./src/routes/kit')

const { notFound, errorHandler } = require('./src/middleware/errorHandler')

const app = express()

// ─── Middleware base ───
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// ─── Ruta de salud ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NOVA backend funcionando' })
})

// ─── Rutas de la API ───
app.use('/api/auth', authRoutes)
app.use('/api/family', familyRoutes)
app.use('/api/vitals', vitalsRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/devices', deviceRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/assistant', assistantRoutes)
app.use('/api/kit', kitRoutes)

// ─── 404 y manejo global de errores (respuesta JSON consistente) ───
app.use(notFound)
app.use(errorHandler)

// ─── Arranque ───
const PORT = process.env.PORT || 4000

connectDB()

app.listen(PORT, () => {
  console.log(`Servidor NOVA escuchando en el puerto ${PORT}`)
})
