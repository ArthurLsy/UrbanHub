import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMeasures } from '../queries/measureQueries'
import type { Sensor } from '../types'

const SensorsPage = () => {
  const { data, isLoading, isError } = useMeasures()

  const sensors = useMemo<Sensor[]>(() => {
    if (!data) return []
    const map = new Map<string, Sensor>()
    data.forEach((m) => {
      if (!map.has(m.sensorId)) {
        map.set(m.sensorId, {
          sensorId: m.sensorId,
          latitude: m.latitude,
          longitude: m.longitude,
          sensorStatus: m.sensorStatus,
          zoneId: m.zoneId,
          sensorTypeId: m.sensorTypeId,
        })
      }
    })
    return Array.from(map.values())
  }, [data])

  return (
    <div>
      <header className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] text-[#00e5a0] tracking-[0.2em] uppercase mb-1">
          Dispositifs de mesure
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-bold tracking-wider text-white uppercase">
          Capteurs
        </h1>
        <div className="mt-3 h-px w-16 bg-[#00e5a0]" />
      </header>

      <div className="rounded border border-[#1e2230] bg-[#111318] p-6">
        {isLoading && (
          <p style={{ fontFamily: 'var(--font-mono)' }} className="text-xs text-[#3d4455] tracking-widest animate-pulse">
            Chargement...
          </p>
        )}
        {isError && (
          <p style={{ fontFamily: 'var(--font-mono)' }} className="text-xs text-red-500/70 tracking-widest">
            Erreur de connexion au backend.
          </p>
        )}
        {data && (
          <ul className="flex flex-col gap-2">
            {sensors.map((sensor) => (
              <li key={sensor.sensorId}>
                <Link
                  to={`/capteurs/${sensor.sensorId}`}
                  className="flex items-center justify-between px-4 py-3 rounded border border-[#1e2230] hover:border-[#00e5a0]/30 hover:bg-[#00e5a0]/5 transition-all duration-150 group"
                >
                  <div className="flex items-center gap-3">
                    <span className={['w-1.5 h-1.5 rounded-full', sensor.sensorStatus ? 'bg-[#00e5a0]' : 'bg-[#3d4455]'].join(' ')} />
                    <span style={{ fontFamily: 'var(--font-mono)' }} className="text-sm text-[#cbd5e1] tracking-wide">
                      {sensor.sensorId}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span style={{ fontFamily: 'var(--font-mono)' }} className={['text-[11px] tracking-widest uppercase', sensor.sensorStatus ? 'text-[#00e5a0]' : 'text-[#3d4455]'].join(' ')}>
                      {sensor.sensorStatus ? 'Actif' : 'Inactif'}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3d4455] group-hover:text-[#00e5a0] transition-colors">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SensorsPage
