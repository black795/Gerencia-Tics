import { useState } from 'react'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'

const DEVICES = [
  { icon: 'ti-watch', name: 'Mi Band 6 · Papá', sub: 'Sync 3 min', subColor: 'var(--nova-teal-mid)', online: true },
  { icon: 'ti-device-watch', name: 'Apple Watch · Boris', sub: 'Sync 1 min', subColor: 'var(--nova-teal-mid)', online: true },
  { icon: 'ti-heart-rate-monitor', name: 'Oxímetro genérico', sub: 'Último dato: 07:42', subColor: 'var(--amber-mid)', online: false },
]

const TOGGLES = [
  { title: 'Procesamiento local', sub: 'Edge AI · datos no salen del celular', subColor: 'var(--nova-teal-mid)', def: true },
  { title: 'Compartir con médico', sub: 'Solo con tu permiso previo', subColor: 'var(--text-secondary)', def: false },
  { title: 'Alertas WhatsApp', sub: 'Enfermera local · bajo demanda', subColor: 'var(--text-secondary)', def: true },
  { title: 'Luz ambiental', sub: 'Focos Philips Hue / Tuya', subColor: 'var(--text-secondary)', def: false },
]

export default function Settings({ go }) {
  const [toggles, setToggles] = useState(TOGGLES.map((t) => t.def))
  const flip = (i) => setToggles((p) => p.map((v, idx) => (idx === i ? !v : v)))

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
        <div className="card-list">
          {DEVICES.map((d, i) => (
            <div className="wrow" key={i}>
              <div>
                <div className="wrow-name">
                  <i className={'ti ' + d.icon} style={{ fontSize: 15, marginRight: 6, color: 'var(--nova-mid)' }} />
                  {d.name}
                </div>
                <div className="wrow-sub" style={{ color: d.subColor }}>{d.sub}</div>
              </div>
              <div className={d.online ? 'dot-on' : 'dot-off'} />
            </div>
          ))}
          <div className="wrow wrow-dashed">
            <div>
              <div className="wrow-name" style={{ color: 'var(--text-secondary)' }}>+ Agregar dispositivo</div>
              <div className="wrow-sub" style={{ color: 'var(--text-tertiary)' }}>Mi Band, Garmin, Fitbit…</div>
            </div>
            <i className="ti ti-plus" style={{ color: 'var(--nova-teal-mid)', fontSize: 18 }} />
          </div>
        </div>

        <div className="sec">Privacidad · tus datos son tuyos</div>
        <div className="pcard">
          {TOGGLES.map((t, i) => (
            <div className="toggle-row" key={i}>
              <div>
                <div className="toggle-title">{t.title}</div>
                <div className="toggle-sub" style={{ color: t.subColor }}>{t.sub}</div>
              </div>
              <div className={'tgl ' + (toggles[i] ? 'on' : 'off')} onClick={() => flip(i)}>
                <div className="tgl-thumb" />
              </div>
            </div>
          ))}
        </div>

        <div className="sec">Plan actual</div>
        <div
          onClick={() => go('kit')}
          style={{
            background: 'var(--card-bg)', borderRadius: 14, border: '0.5px solid var(--border)',
            padding: '13px 14px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Suscripción Familiar</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Activa · se renueva 19 jun</div>
          </div>
          <span className="badge badge-info">Activo</span>
        </div>
        <div style={{ height: 6 }} />
      </div>

      <BottomNav active="settings" go={go} />
    </>
  )
}
