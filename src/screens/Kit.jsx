import StatusBar from '../components/StatusBar'

const ITEMS = [
  { icon: 'ti-droplet', name: 'Oxímetro calibrado para altura', sub: 'Ajustado para 2.500+ m. Evita falsas alarmas.' },
  { icon: 'ti-wind', name: 'Sensor ambiental de dormitorio', sub: 'Temperatura, humedad y CO₂ en tiempo real.' },
  { icon: 'ti-bulb', name: 'Módulo de iluminación inteligente', sub: 'La luz del cuarto cambia según el estado. Sin ruido.' },
]

export default function Kit({ go }) {
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
        <div className="kit-price">
          Bs 280 <span style={{ fontSize: 14, fontWeight: 400 }}>único</span>
        </div>
        <div className="kit-price-sub">Suscripción mensual: Bs 45/mes · incluido</div>
      </div>

      <div className="content">
        <div className="sec">Qué incluye el kit</div>
        <div className="kit-card">
          {ITEMS.map((it, i) => (
            <div className="kit-item" key={i}>
              <i className={'ti ' + it.icon} />
              <div>
                <div className="kit-item-name">{it.name}</div>
                <div className="kit-item-sub">{it.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sec">¿Por qué el kit?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div className="acard">
            <div className="acard-head">
              <i className="ti ti-mountain" style={{ fontSize: 13 }} /> Calibración andina real
            </div>
            <div className="acard-body">
              Diferencia hipoxia de altura de una emergencia. Reduce falsas alarmas en un 60%.
            </div>
          </div>
          <div className="acard">
            <div className="acard-head">
              <i className="ti ti-eye-off" style={{ fontSize: 13 }} /> Avisa sin despertar
            </div>
            <div className="acard-body">
              La luz cambia suavemente. Toda la familia entiende sin alarmas ni
              notificaciones ruidosas.
            </div>
          </div>
        </div>

        <div className="subs-badge">Solo para usuarios con 30+ días activos</div>

        <button className="btn-primary">Pedir mi kit · Bs 280</button>
        <button className="btn-secondary" onClick={() => go('settings')}>
          Ver solo suscripción mensual
        </button>
        <div style={{ height: 6 }} />
      </div>
    </>
  )
}
