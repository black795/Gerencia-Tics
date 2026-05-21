// variant: undefined (deep blue) | 'alert' (dark red) | 'kit' (teal)
export default function StatusBar({ variant }) {
  const style =
    variant === 'alert' ? { background: '#7A1F1F' }
    : variant === 'kit' ? { background: 'var(--nova-teal)' }
    : undefined

  return (
    <div className="sbar" style={style}>
      <span>9:14</span>
      <div className="sbar-icons">
        <i className="ti ti-wifi" style={{ fontSize: 13 }} />
        <i className="ti ti-battery-2" style={{ fontSize: 13 }} />
      </div>
    </div>
  )
}
