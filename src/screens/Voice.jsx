import StatusBar from '../components/StatusBar'

const CHAT = [
  { who: 'user', txt: '¿Cómo durmió la abuela anoche?' },
  {
    who: 'nova',
    txt: 'Durmió algo inquieta. Se despertó dos veces entre las 2 y las 4 de la madrugada. Su saturación estuvo estable, pero el corazón latió un poco más rápido de lo normal. Vale la pena revisarla hoy.',
  },
  { who: 'user', txt: 'Se agitó en la noche. ¿Es grave?' },
  {
    who: 'nova',
    txt: 'No parece grave. La agitación coincidió con una baja leve de temperatura en el cuarto. Para su edad y la altura, es esperable en la semana seca. La ponemos en ámbar y la observamos hoy.',
  },
  { who: 'user', txt: '¿Necesito llevarla al médico?' },
  {
    who: 'nova',
    txt: 'Por ahora no es urgente. Si esta noche vuelve a agitarse o la saturación baja de 89%, sí te recomiendo llamar al médico. ¿Quieres que avise a la enfermera para que te llame mañana?',
  },
]

export default function Voice({ go }) {
  return (
    <>
      <StatusBar />
      <div className="pheader">
        <button className="pheader-back" onClick={() => go('home')}>
          <i className="ti ti-arrow-left" />
        </button>
        <span className="pheader-title">Asistente NOVA</span>
        <button
          className="pheader-action"
          style={{
            fontSize: 10, background: 'var(--nova-teal-pale)', color: 'var(--nova-teal)',
            padding: '4px 10px', borderRadius: 8, border: 'none',
          }}
        >
          Local
        </button>
      </div>

      <div className="content" style={{ gap: 10 }}>
        <div style={{
          background: 'var(--nova-pale)', borderRadius: 14, padding: '11px 13px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <i className="ti ti-lock" style={{ fontSize: 16, color: 'var(--nova-mid)' }} />
          <div style={{ fontSize: 11, color: 'var(--nova-deep)', lineHeight: 1.4 }}>
            Procesamiento en el dispositivo. La voz no sale del celular.
          </div>
        </div>

        {CHAT.map((m, i) => (
          <div className={'bubble ' + m.who} key={i}>
            <div className="bubble-sender">{m.who === 'user' ? 'Tú' : 'NOVA'}</div>
            {m.txt}
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--card-bg)', borderTop: '0.5px solid var(--border)', padding: 14,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          Mantén presionado para hablar
        </div>
        <div className="voice-ring-outer">
          <div className="voice-ring-inner">🎙️</div>
        </div>
      </div>
    </>
  )
}
