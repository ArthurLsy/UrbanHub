import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { useSensors } from '@/queries/sensorQueries'
import { useZones } from '@/queries/zoneQueries'

type Period = '1h' | '24h' | '1week'
const PERIODS: { value: Period; label: string }[] = [
  { value: '1h', label: '1 heure' },
  { value: '24h', label: '24 heures' },
  { value: '1week', label: '1 semaine' },
]

function TrendModule({ title, entity }: { title: string; entity: 'sensor' | 'zone' }) {
  const { data: sensors } = useSensors()
  const { data: zones } = useZones()
  const [selected, setSelected] = useState<string>('')
  const [period, setPeriod] = useState<Period>('24h')

  useEffect(() => {
    if (entity === 'sensor' && sensors && sensors.length > 0 && !selected) {
      setSelected(sensors[0].sensorId)
    }
    if (entity === 'zone' && zones && zones.length > 0 && !selected) {
      setSelected(zones[0].zoneId)
    }
  }, [entity, sensors, zones, selected])

  const options = entity === 'sensor'
    ? (sensors ?? []).map(s => ({ value: s.sensorId, label: s.sensorId }))
    : (zones ?? []).map(z => ({ value: z.zoneId, label: z.zoneId }))

  return (
    <Card className="p-5">
      <CardContent className="p-0">
        <p className="text-[10px] text-[#94a3b8] tracking-[0.15em] uppercase mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
          {title}
        </p>
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div className="flex flex-col gap-2 min-w-[180px]">
            <label className="text-[10px] text-[#94a3b8] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              {entity === 'sensor' ? 'Capteur' : 'Zone'}
            </label>
            <Combobox
              options={options}
              value={selected}
              onChange={setSelected}
              placeholder="Rechercher..."
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[160px]">
            <label className="text-[10px] text-[#94a3b8] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Période
            </label>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {selected ? (
          <p className="text-xs text-[#94a3b8] tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            Données de tendance pour <span className="text-[#00b07d] font-semibold">{selected}</span> — période : {period}
          </p>
        ) : (
          <p className="text-xs text-[#94a3b8] tracking-wider italic" style={{ fontFamily: 'var(--font-mono)' }}>
            Sélectionnez un {entity === 'sensor' ? 'capteur' : 'zone'} pour voir la tendance
          </p>
        )}
      </CardContent>
    </Card>
  )
}

const KpiPage = () => {
  return (
    <div>
      <Breadcrumb items={[{ label: 'KPIs' }]} className="mb-6" />
      <header className="mb-8">
        <p className="text-[12px] text-[#00b07d] tracking-[0.2em] uppercase mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
          Indicateurs clés
        </p>
        <h1 className="text-4xl font-bold tracking-wider text-[#0d0f14] uppercase" style={{ fontFamily: 'var(--font-display)' }}>
          KPIs
        </h1>
        <div className="mt-3 h-1 w-20 bg-[#00e5a0]" />
      </header>

      <Tabs defaultValue="tendance">
        <TabsList>
          <TabsTrigger value="tendance">Tendance</TabsTrigger>
          <TabsTrigger value="moyenne">Moyenne</TabsTrigger>
        </TabsList>

        <TabsContent value="tendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TrendModule title="Tendance par capteur" entity="sensor" />
            <TrendModule title="Tendance par zone" entity="zone" />
          </div>
        </TabsContent>

        <TabsContent value="moyenne">
          <Card className="p-5">
            <CardContent className="p-0">
              <p className="text-[10px] text-[#94a3b8] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                Module moyenne — à définir
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default KpiPage
