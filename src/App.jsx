import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ActiveCalls from './pages/ActiveCalls'
import CallDetail from './pages/CallDetail'
import TicketsQueue from './pages/TicketsQueue'
import BootScreen from './pages/BootScreen'
import SignIn from './pages/SignIn'
import useAriaStore from './store/ariaStore'
import Settings from './pages/Settings'

function App() {
  const startSimulation = useAriaStore((s) => s.startSimulation)
  const [booting, setBooting] = useState(true)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    startSimulation()
  }, [])

  if (booting) {
    return <BootScreen onComplete={() => setBooting(false)} />
  }

  if (!signedIn) {
    return <SignIn onSignIn={() => setSignedIn(true)} />
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calls" element={<ActiveCalls />} />
        <Route path="calls/:callId" element={<CallDetail />} />
        <Route path="tickets" element={<TicketsQueue />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App