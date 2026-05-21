import { useState } from 'react'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'

const TABS = ['Hoy', 'Semana', 'Mes']

const BARS = [
  { day: 'L',   h: 52, bg: 'var(--nova-pale)' },
  { day: 'M',   h: 47, bg: 'var(--nova-pale)' },
  { day: 'Mi',  h: 54, bg: 'var(--nova-pale)' },
  { day: 'J',   h: 36, bg: '#F09595', border: '1px solid var(--red-mid)', dayColor: 'var(--amber-mid)' },
  { day: 'V',   h: 50, bg: 'var(--nova-pale)' },
  { day: 'S',   h: 52, bg: 'var(--nova-pale)' },
  { day: 'Hoy', h: 52, bg: 'var(--nova-teal-pale)', border: '1.5px solid var(--nova-teal-light)', dayColor: 'var(--nova-teal)' },
]

export default function Vitals({ go }) {
  const [tab, setTab] = useState('Hoy')

  return (
    <>
      <StatusBar />
      <div className="pheader">
        <button className="pheader-back" onClick={() => go('home')}>
          <i className="ti ti-arrow-left" />
        </button>
        <span className="pheader-title">Signos vitales · Papá</span>
        <button className="pheader-action">Exportar</button>
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
        <div style={{
          background: 'var(--card-bg)', borderRadius: 14, border: '0.5px solid var(--border)',
          padding: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div className="avatar-lg" style={{ background: 'var(--nova-teal-pale)', color: 'var(--nova-teal)' }}>PT</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Pedro Torrico</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>61 años · Mi Band 6</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <div className="dot-on" />
              <span style={{ fontSize: 10, color: 'var(--nova-teal-mid)' }}>En línea · sync 3 min</span>
            </div>
          </div>
        </div>

        <div className="sec">Ahora mismo</div>
        <div className="vitals-grid">
          <div className="vcard">
            <div className="vcard-icon"><i className="ti ti-droplet" /></div>
            <div className="vcard-val">94 <span className="vcard-unit">%</span></div>
            <div className="vcard-lbl">Saturación O₂</div>
            <span className="badge badge-alt">Normal en altura</span>
          </div>
          <div className="vcard">
            <div className="vcard-icon"><i className="ti ti-heart" /></div>
            <div className="vcard-val">68 <span className="vcard-unit">bpm</span></div>
            <div className="vcard-lbl">Frec. cardíaca</div>
            <span className="badge badge-ok">Estable</span>
          </div>
          <div className="vcard">
            <div className="vcard-icon"><i className="ti ti-moon" /></div>
            <div className="vcard-val">6.4 <span className="vcard-unit">h</span></div>
            <div className="vcard-lbl">Sueño anoche</div>
            <span className="badge badge-ok">Durmió bien</span>
          </div>
          <div className="vcard">
            <div className="vcard-icon"><i className="ti ti-chart-line" /></div>
            <div className="vcard-val">118<span className="vcard-unit">/76</span></div>
            <div className="vcard-lbl">Presión arterial</div>
            <span className="badge badge-ok">Normal</span>
          </div>
        </div>

        <div className="chart-wrap">
          <div className="chart-title">Saturación O₂ · últimos 7 días</div>
          <div className="bars">
            {BARS.map((b, i) => (
              <div className="bar-col" key={i}>
                <div className="bar" style={{ height: b.h, background: b.bg, border: b.border }} />
                <span className="bar-day" style={b.dayColor ? { color: b.dayColor } : undefined}>{b.day}</span>
              </div>
            ))}
          </div>
          <div className="chart-note">
            El jueves bajó por la climatología · variación normal para esta altitud.
          </div>
        </div>

        <div className="acard">
          <div className="acard-head">
            <i className="ti ti-info-circle" style={{ fontSize: 13 }} /> NOVA dice
          </div>
          <div className="acard-body">
            Todo dentro de lo esperado para 61 años a 2.558 m. Sigamos observando esta semana.
          </div>
        </div>
        <div style={{ height: 6 }} />
      </div>

      <BottomNav active="vitals" go={go} />
    </>
  )
}
