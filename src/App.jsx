import { useState } from 'react'
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

export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const Current = SCREENS[screen] || Home

  return (
    <div className="app-stage">
      <PhoneFrame>
        <Current go={setScreen} />
      </PhoneFrame>
    </div>
  )
}
