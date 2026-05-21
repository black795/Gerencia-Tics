import StatusBar from '../components/StatusBar'

export default function AlertRed({ go }) {
  return (
    <>
      <StatusBar variant="alert" />

      <div className="alert-banner">
        <div className="alert-banner-icon">🚨</div>
        <div>
          <div className="alert-banner-title">Saturación baja · Abuela</div>
          <div className="alert-banner-sub">Detectado a las 03:42 · Actuar ahora</div>
        </div>
      </div>

      <div className="content">
        <div className="status-ring-wrap" style={{ borderColor: 'var(--red-border)' }}>
          <div className="status-ring rojo">
            <div className="ring-emoji">⚠️</div>
            <div className="ring-label r">Actuar</div>
          </div>
          <div className="ring-msg" style={{ color: 'var(--red)', fontWeight: 500 }}>
            Saturación 83% · Por debajo del umbral seguro para su edad. Esto no es una
            variación de altura.
          </div>
        </div>

        <div className="acard danger">
          <div className="acard-head">
            <i className="ti ti-heart-rate-monitor" style={{ fontSize: 13 }} /> Lo que vemos
          </div>
          <div className="acard-body">
            La saturación bajó de forma constante durante 40 minutos. No se recuperó al
            cambiar de posición. Esto requiere atención médica.
          </div>
        </div>

        <div className="sec">¿Qué hacer ahora?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="action-btn danger">
            <i className="ti ti-phone-call" />
            <div>
              <div>Llamar al 118 · Emergencias</div>
              <div className="ab-sub">Número nacional de salud Bolivia</div>
            </div>
          </button>
          <button className="action-btn primary" onClick={() => go('voice')}>
            <i className="ti ti-message" />
            <div>
              <div>Avisar a la enfermera NOVA</div>
              <div className="ab-sub">Responde en &lt; 5 minutos</div>
            </div>
          </button>
          <button className="action-btn secondary">
            <i className="ti ti-map-pin" />
            <div>
              <div>Clínicas cercanas abiertas</div>
              <div className="ab-sub">3 clínicas a menos de 2 km</div>
            </div>
          </button>
        </div>

        <div className="acard">
          <div className="acard-head">
            <i className="ti ti-info-circle" style={{ fontSize: 13 }} /> Mientras esperan ayuda
          </div>
          <div className="acard-body">
            Siéntala incorporada, ropa suelta, ventile la habitación. No la deje sola.
            Si tiene inhalador, úselo ahora.
          </div>
        </div>
        <div style={{ height: 6 }} />
      </div>

      <div className="bnav" style={{ background: 'var(--red-bg)', borderTopColor: 'var(--red-border)' }}>
        <button className="bnav-btn" style={{ color: 'var(--red)' }} onClick={() => go('home')}>
          <i className="ti ti-home" />Inicio
        </button>
        <button className="bnav-btn active" style={{ color: 'var(--red-mid)' }}>
          <i className="ti ti-alert-triangle" />Alerta
        </button>
        <button className="bnav-btn" onClick={() => go('history')}>
          <i className="ti ti-clipboard-list" />Historial
        </button>
        <button className="bnav-btn" onClick={() => go('settings')}>
          <i className="ti ti-settings" />Config
        </button>
      </div>
    </>
  )
}
