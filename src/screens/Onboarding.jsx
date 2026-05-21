import StatusBar from '../components/StatusBar'

const STEPS = [
  { n: 1, txt: 'Conecta lo que ya tienes', sub: 'Mi Band, Apple Watch, Garmin, Fitbit…' },
  { n: 2, txt: 'Agrega a tu familia', sub: 'Papás, abuelos, niños — todos en un lugar' },
  { n: 3, txt: 'Entiende en 3 colores', sub: 'Verde, Ámbar o Rojo. Sin clínico ni técnico.' },
]

export default function Onboarding({ go }) {
  return (
    <>
      <StatusBar />
      <div className="content" style={{ paddingTop: 0, gap: 0, justifyContent: 'space-between' }}>
        <div className="ob-hero" style={{ paddingBottom: 10 }}>
          <div className="ob-icon-wrap">🫁</div>
          <div className="ob-dots" style={{ marginBottom: 14 }}>
            <div className="ob-dot active" />
            <div className="ob-dot" />
            <div className="ob-dot" />
          </div>
          <div className="ob-title">Bienvenido a NOVA</div>
          <div className="ob-sub">
            Monitoreo preventivo para tu familia, calibrado para vivir a 2.558 m.
            Simple, privado, en tu idioma.
          </div>
        </div>

        <div className="ob-steps" style={{ padding: '0 14px' }}>
          {STEPS.map((s) => (
            <div className="ob-step" key={s.n}>
              <div className="ob-step-num">{s.n}</div>
              <div>
                <div className="ob-step-txt">{s.txt}</div>
                <div className="ob-step-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn-primary" onClick={() => go('home')}>Comenzar gratis</button>
          <button className="btn-secondary" onClick={() => go('home')}>Ya tengo cuenta</button>
        </div>
      </div>
    </>
  )
}
