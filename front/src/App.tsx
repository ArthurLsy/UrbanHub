import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import ZonesPage from './pages/ZonesPage'
import SensorsPage from './pages/SensorsPage'
import SensorDetailPage from './pages/SensorDetailPage'
import SensorTypesPage from './pages/SensorTypesPage'
import ComparisonPage from './pages/ComparisonPage'
import MapPage from './pages/MapPage'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 bg-[#f8fafc] p-6 md:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/zones" element={<ZonesPage />} />
            <Route path="/capteurs" element={<SensorsPage />} />
            <Route path="/capteurs/:id" element={<SensorDetailPage />} />
            <Route path="/comparaison" element={<ComparisonPage />} />
            <Route path="/carte" element={<MapPage />} />
            <Route path="/types-capteur" element={<SensorTypesPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
