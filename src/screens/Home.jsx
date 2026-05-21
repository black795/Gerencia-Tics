import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'
import { useApi } from '../useApi'
import { Loading, ErrorBox } from '../components/Feedback'
import { clsEstado, tagEstado, ringClass, ringEmoji, labelEstado } from '../ui'

export default function Home({ go }) {
  const { loading, error, data, reload } = useApi('/family/dashboard')

  return (
    <>
      <StatusBar />
      <div className="app-header">
        <div className="brand-row">
          <div className="brand-dot" />
          <div className="brand-name">NOVA</div>
          <div className="brand-tag">biomedical iot</div>
          <button className="brand-bell" onClick={() => go('alert')} aria-label="Alertas">
            <i className="ti ti-bell" />
            {data && data.estadoGeneral !== 'verde' && <span className="bell-badge" />}
          </button>
        </div>
        <div className="header-greeting">{data ? `${data.saludo} 👋` : 'Hola 👋'}</div>
      </div>

      <div className="content">
        {loading && <Loading />}
        {error && <ErrorBox mensaje={error} onRetry={reload} />}

        {data && (
          <>
            <div className="status-ring-wrap">
              <div className={'status-ring ' + ringClass(data.estadoGeneral)}>
                <div className="ring-emoji">{ringEmoji(data.estadoGeneral)}</div>
                <div className={'ring-label ' + clsEstado(data.estadoGeneral)}>
                  {labelEstado(data.estadoGeneral)}
                </div>
              </div>
              <div className="ring-msg">{data.mensajeGeneral}</div>
            </div>

            <div className="sec">Tu familia</div>

            {data.miembros.map((m) => (
              <div
                className={'fcard ' + clsEstado(m.estado)}
                key={m.id}
                onClick={() => go('vitals', { miembroId: m.id, apodo: m.apodo })}
              >
                <div className="fcard-dot">
                  <i className="ti ti-user" style={{ fontSize: 15, color: 'white' }} />
                </div>
                <div>
                  <div className="fcard-tag">{tagEstado(m.estado)}</div>
                  <div className="fcard-name">
                    {m.apodo} · {m.edad} años
                  </div>
                  <div className="fcard-msg">{m.mensajeEstado}</div>
                </div>
              </div>
            ))}

            {data.avisos.map((a, i) =>
              a.tipo === 'enfermera' ? (
                <div
                  className="acard warn tap"
                  key={i}
                  onClick={() => {
                    // El aviso es sobre el familiar a observar: abrimos el chat
                    // del asistente apuntando a ese miembro, no al primero.
                    const obs = data.miembros.find((m) => m.estado !== 'verde')
                    go('voice', obs ? { miembroId: obs.id, apodo: obs.apodo } : {})
                  }}
                >
                  <div className="acard-head">
                    <i className="ti ti-bell" style={{ fontSize: 13 }} /> {a.titulo}
                  </div>
                  <div className="acard-body">{a.mensaje}</div>
                </div>
              ) : (
                <div className="acard" key={i}>
                  <div className="acard-head">
                    <i className="ti ti-mountain" style={{ fontSize: 13 }} /> {a.titulo}
                  </div>
                  <div className="acard-body">{a.mensaje}</div>
                </div>
              ),
            )}
            <div style={{ height: 6 }} />
          </>
        )}
      </div>

      <BottomNav active="home" go={go} />
    </>
  )
}
