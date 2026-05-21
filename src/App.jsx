import { useState } from 'react'
import { AuthProvider, useAuth } from './auth'
import PhoneFrame from './components/PhoneFrame'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Vitals from './screens/Vitals'
import AlertRed from './screens/AlertRed'
import Voice from './screens/Voice'
import History from './screens/History'
import Settings from './screens/Settings'
import Kit from './screens/Kit'

const SCREENS = {
  onboarding: Onboarding,
  home: Home,
  vitals: Vitals,
  alert: AlertRed,
  voice: Voice,
  history: History,
  settings: Settings,
  kit: Kit,
}

function Shell() {
  const { token } = useAuth()
  // nav.params permite pasar datos entre pantallas (ej. el miembro elegido).
  const [nav, setNav] = useState({ screen: 'home', params: {} })
  const go = (screen, params = {}) => setNav({ screen, params })

  // Sin sesión → siempre la pantalla de bienvenida / login.
  if (!token) {
    return (
      <PhoneFrame>
        <Onboarding go={go} />
      </PhoneFrame>
    )
  }

  const Current = SCREENS[nav.screen] || Home
  return (
    <PhoneFrame>
      <Current go={go} params={nav.params} />
    </PhoneFrame>
  )
}

export default function App() {
  return (
    <div className="app-stage">
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </div>
  )
}
