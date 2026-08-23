import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Flights } from './pages/Flights'
import { Customers } from './pages/Customers'
import { Orders } from './pages/Orders'

function AppShell() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-[100dvh] items-center justify-center" style={{ background: 'var(--surface)' }} />
  }

  if (!session) {
    return <Login />
  }

  return (
    <Routes>
      <Route element={<Layout email={session.user.email} />}>
        <Route index element={<Dashboard />} />
        <Route path="flights" element={<Flights />} />
        <Route path="customers" element={<Customers />} />
        <Route path="orders" element={<Orders />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
