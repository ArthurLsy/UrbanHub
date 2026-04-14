import { useMemo } from 'react'
import { useMeasures } from '../queries/measureQueries'

const SensorTypesPage = () => {
  const { data, isLoading, isError } = useMeasures()

  const types = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.map((m) => m.sensorTypeId)))
  }, [data])

  return (
    <div>
      <header className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] text-[#00e5a0] tracking-[0.2em] uppercase mb-1">
          Classification
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-bold tracking-wider text-white uppercase">
          Types de capteur
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
            {types.map((typeId) => (
              <li
                key={typeId}
                className="flex items-center justify-between px-4 py-3 rounded border border-[#1e2230] hover:border-[#00e5a0]/30 hover:bg-[#00e5a0]/5 transition-all duration-150"
              >
                <span style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-semibold tracking-wider text-white uppercase">
                  {typeId}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] text-[#3d4455] tracking-widest">
                  {data.filter((m) => m.sensorTypeId === typeId).length} mesure(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SensorTypesPage
