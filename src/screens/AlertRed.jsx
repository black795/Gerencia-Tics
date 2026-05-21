import { useState } from 'react'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'
import { useApi } from '../useApi'
import { api } from '../api'
import { Loading, ErrorBox } from '../components/Feedback'

const ICONO_ACCION = {
  emergencia: 'ti-phone-call',
  enfermera: 'ti-message',
  clinicas: 'ti-map-pin',
}
const CLASE_ACCION = { emergencia: 'danger', enfermera: 'primary', clinicas: 'secondary' }

function horaTexto(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

// Barra de navegación en versión roja (pantalla de alerta).
function NavRoja({ go }) {
  return (
    <div
      className="bnav"
      style={{ background: 'var(--red-bg)', borderTopColor: 'var(--red-border)' }}
    >
      <button className="bnav-btn" style={{ color: 'var(--red)' }} onClick={() => go('home')}>
        <i className="ti ti-home" />
        Inicio
      </button>
      <button className="bnav-btn active" style={{ color: 'var(--red-mid)' }}>
        <i className="ti ti-alert-triangle" />
        Alerta
      </button>
      <button className="bnav-btn" onClick={() => go('history')}>
        <i className="ti ti-clipboard-list" />
        Historial
      </button>
      <button className="bnav-btn" onClick={() => go('settings')}>
        <i className="ti ti-settings" />
        Config
      </button>
    </div>
  )
}

export default function AlertRed({ go }) {
  const activas = useApi('/alerts/active')
  const alerta = activas.data?.alertas?.[0]
  const detalle = useApi(alerta ? `/alerts/${alerta.id}` : null, [alerta?.id])
  const [aviso, setAviso] = useState(null)

  async function ejecutarAccion(accion, d) {
    if (accion.tipo === 'emergencia' && accion.numero) {
      window.location.href = 'tel:' + accion.numero
      return
    }
    if (accion.tipo === 'enfermera') {
      try {
        await api(`/alerts/${d.id}/notify-nurse`, { method: 'POST' })
      } catch {
        // si falla el aviso, igual abrimos el chat con la enfermera
      }
      go('voice', { miembroId: d.miembroId, apodo: d.miembro?.apodo })
      return
    }
    setAviso('Mostrando clínicas cercanas abiertas… (demo)')
  }

  async function marcarAtendida(d) {
    try {
      await api(`/alerts/${d.id}/read`, { method: 'PUT' })
      go('home')
    } catch (e) {
      setAviso(e.message)
    }
  }

  // ── Sin alertas activas: estado tranquilo ──
  if (!activas.loading && !activas.error && !alerta) {
    return (
      <>
        <StatusBar />
        <div className="app-header">
          <div className="brand-row">
            <div className="brand-dot" />
            <div className="brand-name">NOVA</div>
          </div>
          <div className="header-sub">Alertas</div>
        </div>
        <div className="content">
          <div className="status-ring-wrap">
            <div className="status-ring">
              <div className="ring-emoji">🫁</div>
              <div className="ring-label v">Todo bien</div>
            </div>
            <div className="ring-msg">
              No hay alertas activas. Toda la familia está estable.
            </div>
          </div>
        </div>
        <BottomNav active="home" go={go} />
      </>
    )
  }

  const d = detalle.data

  return (
    <>
      <StatusBar variant="alert" />

      <div className="alert-banner">
        <div className="alert-banner-icon">🚨</div>
        <div>
          <div className="alert-banner-title">
            {d ? `${d.titulo} · ${d.miembro?.apodo || ''}` : 'Alerta de salud'}
          </div>
          <div className="alert-banner-sub">
            {d ? `Detectado a las ${horaTexto(d.detectadoEn)} · Actuar ahora` : 'Cargando…'}
          </div>
        </div>
      </div>

      <div className="content">
        {(activas.loading || detalle.loading) && <Loading />}
        {(activas.error || detalle.error) && (
          <ErrorBox mensaje={activas.error || detalle.error} onRetry={activas.reload} />
        )}

        {d && (
          <>
            <div className="status-ring-wrap" style={{ borderColor: 'var(--red-border)' }}>
              <div className="status-ring rojo">
                <div className="ring-emoji">⚠️</div>
                <div className="ring-label r">Actuar</div>
              </div>
              <div className="ring-msg" style={{ color: 'var(--red)', fontWeight: 500 }}>
                {d.mensaje}
              </div>
            </div>

            <div className="acard danger">
              <div className="acard-head">
                <i className="ti ti-heart-rate-monitor" style={{ fontSize: 13 }} /> Lo que vemos
              </div>
              <div className="acard-body">{d.loQueVemos}</div>
            </div>

            <div className="sec">¿Qué hacer ahora?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {d.acciones.map((a, i) => (
                <button
                  key={i}
                  className={'action-btn ' + (CLASE_ACCION[a.tipo] || 'secondary')}
                  onClick={() => ejecutarAccion(a, d)}
                >
                  <i className={'ti ' + (ICONO_ACCION[a.tipo] || 'ti-circle')} />
                  <div>
                    <div>{a.label}</div>
                    <div className="ab-sub">{a.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            {aviso && (
              <div style={{ fontSize: 11, color: 'var(--nova-mid)', textAlign: 'center' }}>
                {aviso}
              </div>
            )}

            <div className="acard">
              <div className="acard-head">
                <i className="ti ti-info-circle" style={{ fontSize: 13 }} /> Mientras esperan ayuda
              </div>
              <div className="acard-body">{d.mientrasEsperan}</div>
            </div>

            <button className="btn-secondary" onClick={() => marcarAtendida(d)}>
              Marcar como atendida
            </button>
            <div style={{ height: 6 }} />
          </>
        )}
      </div>

      <NavRoja go={go} />
    </>
  )
}
