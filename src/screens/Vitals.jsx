import { useState } from 'react'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'
import { useApi } from '../useApi'
import { Loading, ErrorBox } from '../components/Feedback'
import { badgeClass, iniciales, haceCuanto } from '../ui'

const TABS = ['Hoy', 'Semana', 'Mes']
const ICONOS = {
  saturacionO2: 'ti-droplet',
  frecuencia: 'ti-heart',
  sueño: 'ti-moon',
  presion: 'ti-chart-line',
}

// Altura de la barra (px) en función de la saturación.
function alturaBarra(sat) {
  const v = Math.max(84, Math.min(99, sat || 0))
  return Math.round(30 + ((v - 84) / 15) * 28)
}

// Estilo de la barra según el color que devuelve el backend.
function estiloBarra(color) {
  if (color === 'actual')
    return {
      bg: 'var(--nova-teal-pale)',
      border: '1.5px solid var(--nova-teal-light)',
      dayColor: 'var(--nova-teal)',
    }
  if (color === 'ambar')
    return { bg: 'var(--amber-bg)', border: '1px solid var(--amber-mid)', dayColor: 'var(--amber-mid)' }
  if (color === 'rojo')
    return { bg: '#F09595', border: '1px solid var(--red-mid)', dayColor: 'var(--red-mid)' }
  return { bg: 'var(--nova-pale)' }
}

export default function Vitals({ go, params = {} }) {
  const [tab, setTab] = useState('Hoy')

  // Si no llega un miembro por params, usamos el primero de la familia.
  const miembros = useApi(params.miembroId ? null : '/family/members')
  const miembroId = params.miembroId || miembros.data?.miembros?.[0]?._id
  const current = useApi(miembroId ? `/vitals/${miembroId}/current` : null, [miembroId])
  const range = useApi(miembroId ? `/vitals/${miembroId}/range` : null, [miembroId])

  const cargando = miembros.loading || current.loading || range.loading
  const error = miembros.error || current.error || range.error
  const cur = current.data
  const apodo = cur?.miembro?.apodo || params.apodo || ''

  return (
    <>
      <StatusBar />
      <div className="pheader">
        <button className="pheader-back" onClick={() => go('home')}>
          <i className="ti ti-arrow-left" />
        </button>
        <span className="pheader-title">Signos vitales{apodo ? ` · ${apodo}` : ''}</span>
        <button
          className="pheader-action"
          onClick={() => miembroId && go('history', { miembroId, apodo })}
        >
          Historial
        </button>
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
        {cargando && <Loading />}
        {error && <ErrorBox mensaje={error} />}

        {!cargando && !error && cur && (
          <>
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 14,
                border: '0.5px solid var(--border)',
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                className="avatar-lg"
                style={{ background: 'var(--nova-teal-pale)', color: 'var(--nova-teal)' }}
              >
                {iniciales(cur.miembro.nombre)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {cur.miembro.nombre}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                  {cur.miembro.edad} años
                  {cur.miembro.dispositivo ? ` · ${cur.miembro.dispositivo}` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                  <div className="dot-on" />
                  <span style={{ fontSize: 10, color: 'var(--nova-teal-mid)' }}>
                    En línea · sync {haceCuanto(cur.miembro.ultimoSync)}
                  </span>
                </div>
              </div>
            </div>

            <div className="sec">Ahora mismo</div>
            <div className="vitals-grid">
              {['saturacionO2', 'frecuencia', 'sueño', 'presion'].map((k) => {
                const l = cur.lecturas[k]
                return (
                  <div className="vcard" key={k}>
                    <div className="vcard-icon">
                      <i className={'ti ' + ICONOS[k]} />
                    </div>
                    <div className="vcard-val">
                      {l.valor} <span className="vcard-unit">{l.unidad}</span>
                    </div>
                    <div className="vcard-lbl">{l.label}</div>
                    <span className={'badge ' + badgeClass(l.estado)}>{l.badge}</span>
                  </div>
                )
              })}
            </div>

            <div className="chart-wrap">
              <div className="chart-title">Saturación O₂ · últimos 7 días</div>
              <div className="bars">
                {(range.data?.datos || []).map((b, i) => {
                  const e = estiloBarra(b.color)
                  return (
                    <div className="bar-col" key={i}>
                      <div
                        className="bar"
                        style={{ height: alturaBarra(b.saturacion), background: e.bg, border: e.border }}
                      />
                      <span
                        className="bar-day"
                        style={e.dayColor ? { color: e.dayColor } : undefined}
                      >
                        {b.dia}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="chart-note">{range.data?.notaContexto}</div>
            </div>

            <div className="acard">
              <div className="acard-head">
                <i className="ti ti-info-circle" style={{ fontSize: 13 }} /> NOVA dice
              </div>
              <div className="acard-body">{cur.comentarioNova}</div>
            </div>
            <div style={{ height: 6 }} />
          </>
        )}
      </div>

      <BottomNav active="vitals" go={go} />
    </>
  )
}
