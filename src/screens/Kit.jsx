import { useState } from 'react'
import StatusBar from '../components/StatusBar'
import { useApi } from '../useApi'
import { api } from '../api'
import { Loading, ErrorBox } from '../components/Feedback'

// Iconos del prototipo para los beneficios (el backend no los envía).
const ICONO_BENEFICIO = ['ti-mountain', 'ti-eye-off']

export default function Kit({ go }) {
  const info = useApi('/kit/info')
  const elig = useApi('/kit/eligibility')
  const [estadoPedido, setEstadoPedido] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function pedirKit() {
    if (!elig.data?.elegible) {
      setEstadoPedido(elig.data?.mensaje || 'Aún no puedes pedir el kit.')
      return
    }
    const direccionEnvio = window.prompt('Dirección de envío:')
    if (!direccionEnvio) return
    const telefono = window.prompt('Teléfono de contacto:')
    if (!telefono) return
    setEnviando(true)
    try {
      const r = await api('/kit/request', {
        method: 'POST',
        body: { direccionEnvio, telefono },
      })
      setEstadoPedido(r.mensaje)
    } catch (e) {
      setEstadoPedido('No se pudo registrar el pedido: ' + e.message)
    } finally {
      setEnviando(false)
    }
  }

  const k = info.data

  return (
    <>
      <StatusBar variant="kit" />

      <div className="kit-hero">
        <div className="kit-hero-top">
          <button className="kit-hero-back" onClick={() => go('settings')}>
            <i className="ti ti-arrow-left" />
          </button>
          <div className="kit-hero-eyebrow">Kit familiar</div>
        </div>
        <div className="kit-hero-title">Experiencia completa en casa</div>
        <div className="kit-hero-sub">
          Kit calibrado para altura andina · solo para suscriptores activos
        </div>
        {k && (
          <>
            <div className="kit-price">
              {k.precio.moneda} {k.precio.monto}{' '}
              <span style={{ fontSize: 14, fontWeight: 400 }}>{k.precio.tipo}</span>
            </div>
            <div className="kit-price-sub">
              Suscripción mensual: {k.suscripcion.moneda} {k.suscripcion.monto}/
              {k.suscripcion.periodo} · {k.suscripcion.incluida ? 'incluido' : 'aparte'}
            </div>
          </>
        )}
      </div>

      <div className="content">
        {info.loading && <Loading />}
        {info.error && <ErrorBox mensaje={info.error} onRetry={info.reload} />}

        {k && (
          <>
            <div className="sec">Qué incluye el kit</div>
            <div className="kit-card">
              {k.componentes.map((c, i) => (
                <div className="kit-item" key={i}>
                  <i className={'ti ti-' + c.icono} />
                  <div>
                    <div className="kit-item-name">{c.nombre}</div>
                    <div className="kit-item-sub">{c.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sec">¿Por qué el kit?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {k.beneficios.map((b, i) => (
                <div className="acard" key={i}>
                  <div className="acard-head">
                    <i
                      className={'ti ' + (ICONO_BENEFICIO[i] || 'ti-check')}
                      style={{ fontSize: 13 }}
                    />{' '}
                    {b.titulo}
                  </div>
                  <div className="acard-body">{b.descripcion}</div>
                </div>
              ))}
            </div>

            <div className="subs-badge">{k.requisito}</div>

            {elig.data && (
              <div
                style={{
                  fontSize: 11,
                  textAlign: 'center',
                  color: elig.data.elegible ? 'var(--nova-teal)' : 'var(--amber-mid)',
                }}
              >
                {elig.data.mensaje}
              </div>
            )}

            {estadoPedido && (
              <div
                style={{
                  fontSize: 12,
                  textAlign: 'center',
                  color: 'var(--nova-deep)',
                  background: 'var(--nova-pale)',
                  borderRadius: 12,
                  padding: '10px 12px',
                }}
              >
                {estadoPedido}
              </div>
            )}

            <button className="btn-primary" onClick={pedirKit} disabled={enviando}>
              {enviando
                ? 'Registrando…'
                : `Pedir mi kit · ${k.precio.moneda} ${k.precio.monto}`}
            </button>
            <button className="btn-secondary" onClick={() => go('settings')}>
              Ver solo suscripción mensual
            </button>
            <div style={{ height: 6 }} />
          </>
        )}
      </div>
    </>
  )
}
