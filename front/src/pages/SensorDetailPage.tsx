import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useMeasuresBySensor } from '../queries/measureQueries'
import DataGraph from '../components/DataGraph'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const SensorDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useMeasuresBySensor(id!)
  const sensor = data?.[0]

  return (
    <div>
      <header className="mb-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/capteurs')}
          className="mb-5 text-[#94a3b8] hover:text-[#00b07d] hover:bg-transparent cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux capteurs
        </Button>

        <p className="text-[12px] text-[#00b07d] tracking-[0.2em] uppercase mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
          Relevés du capteur
        </p>
        <h1 className="text-5xl font-bold tracking-wider text-[#0d0f14] uppercase" style={{ fontFamily: 'var(--font-display)' }}>
          {id}
        </h1>
        <div className="mt-4 h-1 w-20 bg-[#00e5a0]" />

        {sensor && (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Badge className={sensor.sensorStatus ? 'bg-[#00e5a0]/10 text-[#00b07d] border border-[#00e5a0]/30' : 'bg-[#f1f5f9] text-[#94a3b8]'}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sensor.sensorStatus ? 'bg-[#00e5a0]' : 'bg-[#94a3b8]'}`} />
              {sensor.sensorStatus ? 'Actif' : 'Inactif'}
            </Badge>
            <span className="text-[13px] text-[#64748b] tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>
              {sensor.latitude}, {sensor.longitude}
            </span>
            <span className="text-[13px] text-[#64748b] tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>
              Zone : {sensor.zoneId}
            </span>
            <Badge className="bg-[#00e5a0]/10 text-[#00b07d] border border-[#00e5a0]/30">
              {sensor.sensorTypeId}
            </Badge>
          </div>
        )}
      </header>

      <Card>
        <CardContent className="p-8">
          {isLoading && (
            <p className="text-sm text-[#94a3b8] tracking-wider animate-pulse" style={{ fontFamily: 'var(--font-mono)' }}>
              Chargement...
            </p>
          )}
          {isError && (
            <p className="text-sm text-red-500 tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
              Erreur de connexion au backend.
            </p>
          )}
          {data && <DataGraph data={data} height={350} />}
        </CardContent>
      </Card>
    </div>
  )
}

export default SensorDetailPage