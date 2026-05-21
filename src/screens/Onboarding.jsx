import { useState } from 'react'
import StatusBar from '../components/StatusBar'
import { api } from '../api'
import { useAuth } from '../auth'

const STEPS = [
  { n: 1, txt: 'Conecta lo que ya tienes', sub: 'Mi Band, Apple Watch, Garmin, Fitbit…' },
  { n: 2, txt: 'Agrega a tu familia', sub: 'Papás, abuelos, niños — todos en un lugar' },
  { n: 3, txt: 'Entiende en 3 colores', sub: 'Verde, Ámbar o Rojo. Sin clínico ni técnico.' },
]

export default function Onboarding({ go }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('alan@nova.bo')
  const [password, setPassword] = useState('nova1234')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    try {
      const r = await api('/auth/login', { method: 'POST', body: { email, password } })
      login(r.token, r.user)
      go('home')
    } catch (err) {
      setError(
        err.message === 'Credenciales inválidas'
          ? 'Email o contraseña incorrectos'
          : err.message,
      )
    } finally {
      setCargando(false)
    }
  }

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

        <form
          onSubmit={entrar}
          style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <input
            className="field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            className="field"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && (
            <div style={{ fontSize: 11, color: 'var(--red)', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <button className="btn-primary" type="submit" disabled={cargando}>
            {cargando ? 'Entrando…' : 'Iniciar sesión'}
          </button>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Cuenta de demo: alan@nova.bo · nova1234
          </div>
        </form>
      </div>
    </>
  )
}
