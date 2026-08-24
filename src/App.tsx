import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Listings } from './pages/Listings'
import { Clients } from './pages/Clients'
import { Cities } from './pages/Cities'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="listings" element={<Listings />} />
          <Route path="clients" element={<Clients />} />
          <Route path="cities" element={<Cities />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
