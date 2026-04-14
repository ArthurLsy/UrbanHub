import { useMesures } from '../queries/mesureQueries'
import DataGraph from '../components/DataGraph'

const MesuresPage = () => {
  const { data, isLoading, isError } = useMesures()

  return (
    <div>
      <header className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] text-[#00e5a0] tracking-[0.2em] uppercase mb-1">
          Données temps réel
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-bold tracking-wider text-white uppercase">
          Mesures
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
        {data && <DataGraph data={data} />}
      </div>
    </div>
  )
}

export default MesuresPage
