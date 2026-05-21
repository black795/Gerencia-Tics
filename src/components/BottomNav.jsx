const TABS = [
  { key: 'home',     icon: 'ti-home',           label: 'Inicio' },
  { key: 'vitals',   icon: 'ti-activity',       label: 'Signos' },
  { key: 'history',  icon: 'ti-clipboard-list', label: 'Historial' },
  { key: 'settings', icon: 'ti-settings',       label: 'Config' },
]

export default function BottomNav({ active, go }) {
  return (
    <div className="bnav">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={'bnav-btn' + (active === t.key ? ' active' : '')}
          onClick={() => go(t.key)}
        >
          <i className={'ti ' + t.icon} />
          {t.label}
        </button>
      ))}
    </div>
  )
}
