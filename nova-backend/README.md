# NOVA — Backend

NOVA es un sistema de monitoreo preventivo de salud familiar pensado para el
contexto andino (Cochabamba, Bolivia · 2.558 m). Recoge los signos vitales de
los miembros de una familia desde wearables, los interpreta con reglas
calibradas para la altura ("Edge AI") y avisa con un lenguaje cercano y no
clínico cuando algo conviene observar. Este repositorio es el **backend**: una
API REST que alimenta las 8 pantallas del prototipo, incluye un simulador de
signos vitales (mientras no hay hardware real) y un asistente conversacional
mock con procesamiento local para preservar la privacidad de la familia.

## Stack

- **Node.js** + **Express 5** — servidor y API REST
- **MongoDB** + **Mongoose** — base de datos y modelado
- **JSON Web Tokens** (`jsonwebtoken`) — autenticación
- **bcryptjs** — hash de contraseñas
- **cors**, **morgan** — middleware base
- **dotenv** — variables de entorno
- **nodemon** — recarga en desarrollo

## Instalación y puesta en marcha

Requisitos previos: Node.js 18+ y una instancia de MongoDB accesible.

1. **Instalar dependencias**
   ```bash
   cd nova-backend
   npm install
   ```

2. **Configurar variables de entorno** — crear un archivo `.env` en `nova-backend/`:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/nova
   JWT_SECRET=cambiar_esto
   ```

3. **Cargar datos de ejemplo** (familia Torrico del prototipo):
   ```bash
   npm run seed
   ```
   Usuario de prueba → email `alan@nova.bo` · contraseña `nova1234`

4. **Arrancar el servidor**
   ```bash
   npm start      # producción
   npm run dev    # desarrollo (nodemon)
   ```
   La API queda en `http://localhost:4000`.

5. **Simulador de signos vitales** (opcional, en otra terminal) — genera lecturas
   nuevas cada 30 s y dispara alertas automáticamente:
   ```bash
   npm run simulator
   ```

6. **Forzar una lectura manual** (útil para probar las alertas):
   ```bash
   npm run force                 # lectura roja para la Abuela
   npm run force -- Papá ambar   # otra banda / miembro
   ```

## Endpoints

Todas las rutas devuelven JSON. Las marcadas con 🔒 requieren el header
`Authorization: Bearer <token>`.

### Salud
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servidor |

### Autenticación — `/api/auth`
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registra usuario + familia + ajustes |
| POST | `/api/auth/login` | Inicia sesión, devuelve token JWT |
| GET 🔒 | `/api/auth/me` | Datos del usuario autenticado |

### Familia — `/api/family`
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/api/family/dashboard` | Datos de la pantalla de inicio |
| GET 🔒 | `/api/family/members` | Lista de miembros monitoreados |
| GET 🔒 | `/api/family/members/:id` | Detalle de un miembro |

### Signos vitales — `/api/vitals`
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/api/vitals/:miembroId/current` | Última lectura interpretada |
| GET 🔒 | `/api/vitals/:miembroId/range` | Histórico para el gráfico semanal |

### Alertas — `/api/alerts`
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/api/alerts/active` | Alertas no leídas de la familia |
| GET 🔒 | `/api/alerts/:id` | Detalle de la alerta (pantalla roja) |
| PUT 🔒 | `/api/alerts/:id/read` | Marca la alerta como leída |
| POST 🔒 | `/api/alerts/:id/notify-nurse` | Avisa a la enfermera NOVA (mock) |

### Historial — `/api/history`
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/api/history/:miembroId?tab=eventos\|metricas\|reportes` | Historial por pestaña |
| GET 🔒 | `/api/history/:miembroId/weekly-report` | Metadata del reporte semanal |

### Dispositivos — `/api/devices`
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/api/devices` | Lista de dispositivos de la familia |
| POST 🔒 | `/api/devices` | Agrega un dispositivo |
| DELETE 🔒 | `/api/devices/:id` | Elimina un dispositivo |

### Ajustes — `/api/settings`
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/api/settings` | Toggles de configuración |
| PUT 🔒 | `/api/settings` | Actualiza los toggles |
| GET 🔒 | `/api/settings/plan` | Datos de la suscripción |

### Asistente — `/api/assistant`
| Método | Ruta | Descripción |
|---|---|---|
| POST 🔒 | `/api/assistant/message` | Envía un mensaje al asistente (mock, local) |
| GET 🔒 | `/api/assistant/conversation/:miembroId` | Últimas interacciones |

### Kit familiar — `/api/kit`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/kit/info` | Información del Kit (público) |
| GET 🔒 | `/api/kit/eligibility` | ¿El usuario lleva 30+ días activo? |
| POST 🔒 | `/api/kit/request` | Registra un pedido del Kit |

## Pantallas del prototipo → endpoint que las alimenta

| # | Pantalla | Endpoint principal |
|---|---|---|
| 1 | Onboarding / Login | `/api/auth/register`, `/api/auth/login` |
| 2 | Inicio (familia) | `/api/family/dashboard` |
| 3 | Signos vitales | `/api/vitals/:miembroId/current` y `/range` |
| 4 | Alerta roja | `/api/alerts/:id` |
| 5 | Asistente de voz | `/api/assistant/message` |
| 6 | Historial | `/api/history/:miembroId` |
| 7 | Configuración | `/api/settings`, `/api/settings/plan`, `/api/devices` |
| 8 | Kit familiar | `/api/kit/info`, `/api/kit/eligibility` |

## Estructura del proyecto

```
nova-backend/
├── server.js                 Punto de entrada · monta rutas y middleware
├── package.json
├── .env                      Variables de entorno (no versionado)
└── src/
    ├── config/
    │   └── db.js             Conexión a MongoDB
    ├── middleware/
    │   ├── auth.js           Verificación del token JWT
    │   └── errorHandler.js   404 y manejo global de errores
    ├── models/               Esquemas Mongoose
    │   ├── User.js           Family.js          FamilyMember.js
    │   ├── Device.js         VitalSign.js       Alert.js
    │   ├── HistoryEvent.js   Settings.js        Conversation.js
    │   └── KitOrder.js
    ├── controllers/          Lógica de cada recurso
    │   ├── authController.js       familyController.js
    │   ├── vitalsController.js     alertController.js
    │   ├── historyController.js    deviceController.js
    │   ├── settingsController.js   assistantController.js
    │   └── kitController.js
    ├── routes/               Definición de rutas Express
    │   ├── auth.js   family.js   vitals.js   alerts.js   history.js
    │   ├── devices.js   settings.js   assistant.js   kit.js
    └── utils/
        ├── token.js              Generación de JWT
        ├── healthRules.js        Reglas de interpretación (Edge AI)
        ├── vitalsSimulator.js    Generador de lecturas
        ├── simulator-runner.js   Simulador en vivo (npm run simulator)
        ├── alertEngine.js        Motor de alertas (rojo / ámbar persistente)
        ├── familyGuard.js        Validación de pertenencia a la familia
        ├── force-reading.js      Lectura manual forzada (npm run force)
        └── seed.js               Datos de ejemplo (npm run seed)
```

## Próximos pasos (v2)

- **IA real en el asistente** — reemplazar el mock por palabras clave por un
  modelo conversacional. Manteniendo la promesa de privacidad: idealmente
  inferencia local (Edge) o, si va a la nube, con consentimiento explícito.
- **Integración con wearables reales** — sustituir el simulador por la ingesta
  de datos de Mi Band, Apple Watch, Garmin, etc. vía sus APIs o BLE.
- **Hardware del Kit familiar** — conectar el oxímetro calibrado, el sensor
  ambiental y el módulo de iluminación, hoy sólo descritos en la pantalla 8.
- **App móvil nativa** — empaquetar el frontend como app iOS/Android con
  notificaciones push para las alertas.
- **Generación real de reportes PDF** — el reporte semanal hoy devuelve sólo
  metadata (`pdfUrl: null`).
- **Pestañas de métricas y reportes del historial** — actualmente placeholders.
- **Pagos del Kit** — `POST /api/kit/request` registra el pedido pero no
  procesa el cobro.
- **Notificaciones a la enfermera** — `notify-nurse` sólo registra el evento;
  falta el canal real (WhatsApp / llamada).
- **Endurecimiento** — rate limiting, validación de inputs con esquemas,
  rotación de `JWT_SECRET`, logs estructurados y tests automatizados.
