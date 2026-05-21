import { useState, useEffect } from 'react'
import StatusBar from '../components/StatusBar'
import { useApi } from '../useApi'
import { api } from '../api'

export default function Voice({ go, params = {} }) {
  // Si no llega un miembro por params, usamos el primero de la familia.
  const miembros = useApi(params.miembroId ? null : '/family/members')
  const miembroId = params.miembroId || miembros.data?.miembros?.[0]?._id
  const conv = useApi(miembroId ? `/assistant/conversation/${miembroId}` : null, [miembroId])
  const apodo = params.apodo || miembros.data?.miembros?.[0]?.apodo || ''

  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Cargar el historial de conversación cuando llega del backend.
  useEffect(() => {
    if (conv.data) setMensajes(conv.data.mensajes || [])
  }, [conv.data])

  async function enviar(e) {
    e.preventDefault()
    const t = texto.trim()
    if (!t || !miembroId || enviando) return
    setTexto('')
    setMensajes((m) => [...m, { rol: 'user', texto: t }])
    setEnviando(true)
    try {
      const r = await api('/assistant/message', {
        method: 'POST',
        body: { miembroId, mensaje: t },
      })
      setMensajes((m) => [...m, { rol: 'nova', texto: r.respuesta }])
    } catch (err) {
      setMensajes((m) => [
        ...m,
        { rol: 'nova', texto: 'No pude responder ahora mismo: ' + err.message },
      ])
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <StatusBar />
      <div className="pheader">
        <button className="pheader-back" onClick={() => go('home')}>
          <i className="ti ti-arrow-left" />
        </button>
        <span className="pheader-title">
          Asistente NOVA{apodo ? ` · ${apodo}` : ''}
        </span>
        <span
          className="pheader-action"
          style={{
            fontSize: 10,
            background: 'var(--nova-teal-pale)',
            color: 'var(--nova-teal)',
            padding: '4px 10px',
            borderRadius: 8,
            border: 'none',
          }}
        >
          Local
        </span>
      </div>

      <div className="content" style={{ gap: 10 }}>
        <div
          style={{
            background: 'var(--nova-pale)',
            borderRadius: 14,
            padding: '11px 13px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <i className="ti ti-lock" style={{ fontSize: 16, color: 'var(--nova-mid)' }} />
          <div style={{ fontSize: 11, color: 'var(--nova-deep)', lineHeight: 1.4 }}>
            Procesamiento en el dispositivo. Tus conversaciones no salen del celular.
          </div>
        </div>

        {mensajes.length === 0 && !conv.loading && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              padding: '20px 10px',
            }}
          >
            Preguntá a NOVA sobre el sueño, la saturación o cómo está hoy tu familiar.
          </div>
        )}

        {mensajes.map((m, i) => (
          <div className={'bubble ' + m.rol} key={i}>
            <div className="bubble-sender">{m.rol === 'user' ? 'Tú' : 'NOVA'}</div>
            {m.texto}
          </div>
        ))}

        {enviando && (
          <div className="bubble nova">
            <div className="bubble-sender">NOVA</div>
            <span style={{ color: 'var(--text-tertiary)' }}>escribiendo…</span>
          </div>
        )}
      </div>

      <form
        onSubmit={enviar}
        style={{
          background: 'var(--card-bg)',
          borderTop: '0.5px solid var(--border)',
          padding: 12,
          display: 'flex',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <input
          className="field"
          placeholder="Escribe tu pregunta…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          style={{
            flexShrink: 0,
            width: 44,
            borderRadius: 12,
            border: 'none',
            background: 'var(--nova-mid)',
            color: 'white',
            fontSize: 16,
            cursor: 'pointer',
          }}
          aria-label="Enviar"
        >
          <i className="ti ti-send" />
        </button>
      </form>
    </>
  )
}
