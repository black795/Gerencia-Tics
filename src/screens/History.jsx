import { useState } from 'react'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'

const TABS = ['Eventos', 'Métricas', 'Reportes']

const DAYS = [
  {
    label: 'HOY · Martes 19 mayo',
    items: [
      { color: 'var(--amber-mid)', txt: 'Sueño irregular · despertó 2 veces', time: '02:14 y 03:58' },
      { color: 'var(--green-mid)', txt: 'Saturación estable toda la noche · 91–93%', time: '00:00 — 07:30' },
    ],
  },
  {
    label: 'AYER · Lunes 18 mayo',
    items: [
      { color: 'var(--nova-mid)', txt: 'Reporte enviado al Dr. Vargas (con permiso)', time: '18:30' },
      { color: 'var(--amber-mid)', txt: 'Frecuencia cardíaca elevada · 88 bpm en reposo', time: '14:00 — 15:30' },
      { color: 'var(--green-mid)', txt: 'Presión 128/82 · normal para su edad', time: '08:15' },
    ],
  },
  {
    label: 'DOMINGO 17 mayo',
    items: [
      { color: 'var(--nova-mid)', txt: 'Enfermera NOVA · llamada de seguimiento', time: '10:00 · 8 min' },
      { color: 'var(--green-mid)', txt: 'Sueño estable · 7.2 h continuas', time: '22:00 — 05:12' },
    ],
  },
]

export default function History({ go }) {
  const [tab, setTab] = useState('Eventos')

  return (
    <>
      <StatusBar />
      <div className="pheader">
        <button className="pheader-back" onClick={() => go('home')}>
          <i className="ti ti-arrow-left" />
        </button>
        <span className="pheader-title">Historial · Abuela</span>
        <button className="pheader-action">PDF</button>
      </div>

      <div className="ntabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={'ntab' + (tab === t ? ' active' : '')}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="content">
        {DAYS.map((d) => (
          <div key={d.label}>
            <div className="hist-day">{d.label}</div>
            <div className="card-list">
              {d.items.map((it, i) => (
                <div className="hist-item" key={i}>
                  <div className="hist-dot" style={{ background: it.color }} />
                  <div>
                    <div className="hist-txt">{it.txt}</div>
                    <div className="hist-time">{it.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{
          background: 'var(--nova-teal-pale)', borderRadius: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <i className="ti ti-file-description" style={{ fontSize: 20, color: 'var(--nova-teal)' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nova-teal)' }}>
              Reporte semanal listo
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Semana del 12 al 18 de mayo · Compartir con médico
            </div>
          </div>
        </div>
        <div style={{ height: 6 }} />
      </div>

      <BottomNav active="history" go={go} />
    </>
  )
}
