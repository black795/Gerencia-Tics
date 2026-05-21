// Estados de carga y error reutilizables dentro de las pantallas.

export function Loading({ texto = 'Cargando…' }) {
  return (
    <div
      style={{
        padding: '40px 14px',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 12,
      }}
    >
      {texto}
    </div>
  )
}

export function ErrorBox({ mensaje, onRetry }) {
  return (
    <div
      style={{
        margin: 14,
        padding: 14,
        background: 'var(--red-bg)',
        border: '0.5px solid var(--red-border)',
        borderRadius: 14,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: onRetry ? 8 : 0 }}>
        {mensaje}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            fontSize: 11,
            padding: '5px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--red-mid)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
