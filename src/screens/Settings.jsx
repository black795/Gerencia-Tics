import { useState, useEffect } from 'react'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'
import { useApi } from '../useApi'
import { api } from '../api'
import { useAuth } from '../auth'
import { Loading, ErrorBox } from '../components/Feedback'
import { haceCuanto } from '../ui'

// Orden y textos de los toggles de privacidad.
const ORDEN_TOGGLES = ['procesamientoLocal', 'compartirConMedico', 'alertasWhatsapp', 'luzAmbiental']
const TOGGLE_INFO = {
  procesamientoLocal: {
    title: 'Procesamiento local',
    sub: 'Edge AI · datos no salen del celular',
    subColor: 'var(--nova-teal-mid)',
  },
  compartirConMedico: {
    title: 'Compartir con médico',
    sub: 'Solo con tu permiso previo',
    subColor: 'var(--text-secondary)',
  },
  alertasWhatsapp: {
    title: 'Alertas WhatsApp',
    sub: 'Enfermera local · bajo demanda',
    subColor: 'var(--text-secondary)',
  },
  luzAmbiental: {
    title: 'Luz ambiental',
    sub: 'Focos Philips Hue / Tuya',
    subColor: 'var(--text-secondary)',
  },
}

const ICONO_DISPOSITIVO = {
  mi_band: 'ti-watch',
  apple_watch: 'ti-device-watch',
  garmin: 'ti-watch',
  fitbit: 'ti-watch',
  oximetro: 'ti-heart-rate-monitor',
  otro: 'ti-device-watch',
}

export default function Settings({ go }) {
  const { logout } = useAuth()
  const ajustes = useApi('/settings')
  const plan = useApi('/settings/plan')
  const dispositivos = useApi('/devices')

  const [toggles, setToggles] = useState(null)
  useEffect(() => {
    if (ajustes.data) setToggles(ajustes.data)
  }, [ajustes.data])

  async function flip(clave) {
    const anterior = toggles
    const nuevo = { ...toggles, [clave]: !toggles[clave] }
    setToggles(nuevo) // actualización optimista
    try {
      const r = await api('/settings', { method: 'PUT', body: nuevo })
      setToggles(r)
    } catch {
      setToggles(anterior) // revertir si falla
    }
  }

  async function agregarDispositivo() {
    const nombre = window.prompt('Nombre del nuevo dispositivo (ej. Mi Band 7):')
    if (!nombre) return
    try {
      await api('/devices', { method: 'POST', body: { tipo: 'otro', nombre } })
      dispositivos.reload()
    } catch (e) {
      window.alert('No se pudo agregar: ' + e.message)
    }
  }

  return (
    <>
      <StatusBar />
      <div className="app-header">
        <div className="brand-row">
          <div className="brand-dot" />
          <div className="brand-name">NOVA</div>
        </div>
        <div className="header-sub">Configuración</div>
      </div>

      <div className="content">
        <div className="sec">Dispositivos</div>
        {dispositivos.loading && <Loading />}
        {dispositivos.error && <ErrorBox mensaje={dispositivos.error} onRetry={dispositivos.reload} />}
        {dispositivos.data && (
          <div className="card-list">
            {dispositivos.data.dispositivos.map((d) => (
              <div className="wrow" key={d._id}>
                <div>
                  <div className="wrow-name">
                    <i
                      className={'ti ' + (ICONO_DISPOSITIVO[d.tipo] || 'ti-device-watch')}
                      style={{ fontSize: 15, marginRight: 6, color: 'var(--nova-mid)' }}
                    />
                    {d.nombre}
                  </div>
                  <div
                    className="wrow-sub"
                    style={{ color: d.activo ? 'var(--nova-teal-mid)' : 'var(--amber-mid)' }}
                  >
                    {d.activo ? `Sync ${haceCuanto(d.ultimoSync)}` : 'Sin conexión'}
                  </div>
                </div>
                <div className={d.activo ? 'dot-on' : 'dot-off'} />
              </div>
            ))}
            <div className="wrow wrow-dashed" onClick={agregarDispositivo}>
              <div>
                <div className="wrow-name" style={{ color: 'var(--text-secondary)' }}>
                  + Agregar dispositivo
                </div>
                <div className="wrow-sub" style={{ color: 'var(--text-tertiary)' }}>
                  Mi Band, Garmin, Fitbit…
                </div>
              </div>
              <i className="ti ti-plus" style={{ color: 'var(--nova-teal-mid)', fontSize: 18 }} />
            </div>
          </div>
        )}

        <div className="sec">Privacidad · tus datos son tuyos</div>
        {ajustes.loading && <Loading />}
        {ajustes.error && <ErrorBox mensaje={ajustes.error} onRetry={ajustes.reload} />}
        {toggles && (
          <div className="pcard">
            {ORDEN_TOGGLES.map((clave) => {
              const info = TOGGLE_INFO[clave]
              return (
                <div className="toggle-row" key={clave}>
                  <div>
                    <div className="toggle-title">{info.title}</div>
                    <div className="toggle-sub" style={{ color: info.subColor }}>
                      {info.sub}
                    </div>
                  </div>
                  <div
                    className={'tgl ' + (toggles[clave] ? 'on' : 'off')}
                    onClick={() => flip(clave)}
                  >
                    <div className="tgl-thumb" />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="sec">Plan actual</div>
        {plan.data && (
          <div
            onClick={() => go('kit')}
            style={{
              background: 'var(--card-bg)',
              borderRadius: 14,
              border: '0.5px solid var(--border)',
              padding: '13px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {plan.data.nombre}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {plan.data.activa ? 'Activa' : 'Inactiva'}
                {plan.data.renovacion ? ` · se renueva ${plan.data.renovacion}` : ''}
              </div>
            </div>
            <span className="badge badge-info">{plan.data.badge}</span>
          </div>
        )}

        <button
          className="btn-secondary"
          style={{ marginTop: 4 }}
          onClick={logout}
        >
          Cerrar sesión
        </button>
        <div style={{ height: 6 }} />
      </div>

      <BottomNav active="settings" go={go} />
    </>
  )
}
