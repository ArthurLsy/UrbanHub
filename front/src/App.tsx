import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MesuresPage from './pages/MesuresPage'
import ZonesPage from './pages/ZonesPage'
import CapteursPage from './pages/CapteursPage'
import CapteurDetailPage from './pages/CapteurDetailPage'
import TypesCapteurPage from './pages/TypesCapteurPage'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 bg-[#0d0f14] p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/mesures" replace />} />
            <Route path="/mesures" element={<MesuresPage />} />
            <Route path="/zones" element={<ZonesPage />} />
            <Route path="/capteurs" element={<CapteursPage />} />
            <Route path="/capteurs/:id" element={<CapteurDetailPage />} />
            <Route path="/types-capteur" element={<TypesCapteurPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
