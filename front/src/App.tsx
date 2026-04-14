import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MeasuresPage from './pages/MeasuresPage'
import ZonesPage from './pages/ZonesPage'
import SensorsPage from './pages/SensorsPage'
import SensorDetailPage from './pages/SensorDetailPage'
import SensorTypesPage from './pages/SensorTypesPage'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 bg-[#0d0f14] p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/mesures" replace />} />
            <Route path="/mesures" element={<MeasuresPage />} />
            <Route path="/zones" element={<ZonesPage />} />
            <Route path="/capteurs" element={<SensorsPage />} />
            <Route path="/capteurs/:id" element={<SensorDetailPage />} />
            <Route path="/types-capteur" element={<SensorTypesPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
