import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'

const FAMILY = [
  {
    cls: 'v', tag: 'Verde', name: 'Papá · 61 años',
    msg: 'Saturación 94% · estable para la altura', to: 'vitals',
  },
  {
    cls: 'a', tag: 'Ámbar · observar', name: 'Abuela · 74 años',
    msg: '3 noches con sueño irregular. La revisaremos juntos.', to: 'history',
  },
  {
    cls: 'v', tag: 'Verde', name: 'Sofía · 8 años',
    msg: 'Durmió estable · frecuencia normal', to: 'vitals',
  },
]

export default function Home({ go }) {
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
            <span className="bell-badge" />
          </button>
        </div>
        <div className="header-greeting">Buenos días, familia Torrico 👋</div>
      </div>

      <div className="content">
        <div className="status-ring-wrap">
          <div className="status-ring">
            <div className="ring-emoji">🫁</div>
            <div className="ring-label v">Todo bien</div>
          </div>
          <div className="ring-msg">
            Todos los signos vitales están estables. No hay nada que observar esta mañana.
          </div>
        </div>

        <div className="sec">Tu familia</div>

        {FAMILY.map((f, i) => (
          <div className={'fcard ' + f.cls} key={i} onClick={() => go(f.to)}>
            <div className="fcard-dot">
              <i className="ti ti-user" style={{ fontSize: 15, color: 'white' }} />
            </div>
            <div>
              <div className="fcard-tag">{f.tag}</div>
              <div className="fcard-name">{f.name}</div>
              <div className="fcard-msg">{f.msg}</div>
            </div>
          </div>
        ))}

        <div className="acard warn tap" onClick={() => go('voice')}>
          <div className="acard-head">
            <i className="ti ti-bell" style={{ fontSize: 13 }} /> Aviso de enfermera
          </div>
          <div className="acard-body">
            ¿Revisamos juntos el informe de la abuela? Puede responder cuando quiera.
          </div>
        </div>

        <div className="acard">
          <div className="acard-head">
            <i className="ti ti-mountain" style={{ fontSize: 13 }} /> Contexto andino
          </div>
          <div className="acard-body">
            Semana seca en Cochabamba. La saturación puede bajar 1–2 puntos. Es completamente normal.
          </div>
        </div>
        <div style={{ height: 6 }} />
      </div>

      <BottomNav active="home" go={go} />
    </>
  )
}
