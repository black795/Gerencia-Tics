import { useState } from 'react'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'
import { useApi } from '../useApi'
import { Loading, ErrorBox } from '../components/Feedback'
import { colorHist } from '../ui'

const TABS = [
  { label: 'Eventos', api: 'eventos' },
  { label: 'Métricas', api: 'metricas' },
  { label: 'Reportes', api: 'reportes' },
]

export default function History({ go, params = {} }) {
  const [tab, setTab] = useState('eventos')

  // Si no llega un miembro por params, usamos el primero de la familia.
  const miembros = useApi(params.miembroId ? null : '/family/members')
  const primero = miembros.data?.miembros?.[0]
  const miembroId = params.miembroId || primero?._id
  const apodo = params.apodo || primero?.apodo || ''

  const hist = useApi(miembroId ? `/history/${miembroId}?tab=${tab}` : null, [miembroId, tab])
  const reporte = useApi(miembroId ? `/history/${miembroId}/weekly-report` : null, [miembroId])

  const data = hist.data

  return (
    <>
      <StatusBar />
      <div className="pheader">
        <button className="pheader-back" onClick={() => go('home')}>
          <i className="ti ti-arrow-left" />
        </button>
        <span className="pheader-title">Historial{apodo ? ` · ${apodo}` : ''}</span>
        <button className="pheader-action">PDF</button>
      </div>

      <div className="ntabs">
        {TABS.map((t) => (
          <button
            key={t.api}
            className={'ntab' + (tab === t.api ? ' active' : '')}
            onClick={() => setTab(t.api)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="content">
        {(miembros.loading || hist.loading) && <Loading />}
        {(miembros.error || hist.error) && (
          <ErrorBox mensaje={miembros.error || hist.error} onRetry={hist.reload} />
        )}

        {/* Pestaña Eventos: agrupados por día */}
        {data && data.dias && (
          <>
            {data.dias.length === 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-tertiary)',
                  textAlign: 'center',
                  padding: '20px 10px',
                }}
              >
                Aún no hay eventos registrados.
              </div>
            )}
            {data.dias.map((dia) => (
              <div key={dia.fecha}>
                <div className="hist-day">{dia.fecha}</div>
                <div className="card-list">
                  {dia.eventos.map((ev, i) => (
                    <div className="hist-item" key={i}>
                      <div className="hist-dot" style={{ background: colorHist(ev.color) }} />
                      <div>
                        <div className="hist-txt">{ev.texto}</div>
                        <div className="hist-time">{ev.hora}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Pestañas Métricas / Reportes: placeholder del backend */}
        {data && data.disponible === false && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              padding: '30px 14px',
            }}
          >
            {data.mensaje}
          </div>
        )}

        {/* Reporte semanal */}
        {reporte.data && (
          <div
            style={{
              background: 'var(--nova-teal-pale)',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <i
              className="ti ti-file-description"
              style={{ fontSize: 20, color: 'var(--nova-teal)' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nova-teal)' }}>
                Reporte semanal listo
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {reporte.data.semana} · Compartir con médico
              </div>
            </div>
          </div>
        )}
        <div style={{ height: 6 }} />
      </div>

      <BottomNav active="history" go={go} />
    </>
  )
}
