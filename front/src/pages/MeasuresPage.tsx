import { useMeasures } from '../queries/measureQueries'
import DataGraph from '../components/DataGraph'
import { Card, CardContent } from '@/components/ui/card'

const MeasuresPage = () => {
  const { data, isLoading, isError } = useMeasures()

  return (
    <div>
      <header className="mb-8">
        <p className="text-[10px] text-[#00e5a0] tracking-[0.2em] uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
          Données temps réel
        </p>
        <h1 className="text-4xl font-bold tracking-wider text-white uppercase" style={{ fontFamily: 'var(--font-display)' }}>
          Mesures
        </h1>
        <div className="mt-3 h-px w-16 bg-[#00e5a0]" />
      </header>

      <Card className="bg-[#111318] border-[#1e2230]">
        <CardContent className="p-6">
          {isLoading && (
            <p className="text-xs text-[#3d4455] tracking-widest animate-pulse" style={{ fontFamily: 'var(--font-mono)' }}>
              Chargement...
            </p>
          )}
          {isError && (
            <p className="text-xs text-red-500/70 tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
              Erreur de connexion au backend.
            </p>
          )}
          {data && <DataGraph data={data} />}
        </CardContent>
      </Card>
    </div>
  )
}

export default MeasuresPage