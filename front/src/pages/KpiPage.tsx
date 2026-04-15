import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useSensors } from '@/queries/sensorQueries'
import { useZones } from '@/queries/zoneQueries'

type Period = '1h' | '24h' | '1week'
type Unit = 'percent' | 'unit'
const PERIODS: { value: Period; label: string }[] = [
  { value: '1h', label: '1 heure' },
  { value: '24h', label: '24 heures' },
  { value: '1week', label: '1 semaine' },
]

// mock value per entity (signed)
const MOCK_VALUES: Record<string, { percent: string; unit: string; unitLabel: string; positive: boolean }> = {
  sensor: { percent: '+74', unit: '+68', unitLabel: 'μg/m³', positive: true },
  zone: { percent: '-12', unit: '-8', unitLabel: 'dB', positive: false },
}

function TrendModule({ title, entity }: { title: string; entity: 'sensor' | 'zone' }) {
  const { data: sensors } = useSensors()
  const { data: zones } = useZones()
  const [selected, setSelected] = useState<string>('')
  const [period, setPeriod] = useState<Period>('24h')
  const [unit, setUnit] = useState<Unit>('percent')

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

  const mock = MOCK_VALUES[entity]
  const displayValue = unit === 'percent' ? mock.percent : mock.unit
  const valueColor = mock.positive ? 'text-[#00b07d]' : 'text-red-500'

  return (
    <Card className="p-6">
      <CardContent className="p-0 flex flex-col items-center gap-4">
        {/* Header row */}
        <div className="flex items-center justify-between w-full gap-3">
          <p className="text-[11px] text-[#94a3b8] tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            {title}
          </p>
          <ToggleGroup
            type="single"
            value={unit}
            onValueChange={(v) => { if (v) setUnit(v as Unit) }}
          >
            <ToggleGroupItem value="percent" variant="outline" className="h-6 px-2 text-[10px]">
              %
            </ToggleGroupItem>
            <ToggleGroupItem value="unit" variant="outline" className="h-6 px-2 text-[10px]">
              {mock.unitLabel}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 w-full">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] text-[#94a3b8] tracking-wider uppercase mb-1.5 block" style={{ fontFamily: 'var(--font-mono)' }}>
              {entity === 'sensor' ? 'Capteur' : 'Zone'}
            </label>
            <Combobox
              options={options}
              value={selected}
              onChange={setSelected}
              placeholder="Rechercher..."
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] text-[#94a3b8] tracking-wider uppercase mb-1.5 block" style={{ fontFamily: 'var(--font-mono)' }}>
              Période
            </label>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="h-11 text-sm w-full">
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

        {/* Big value square */}
        <div className="w-full rounded-xl border border-[#e2e8f0] bg-white flex flex-col items-center justify-center py-8 px-4 mt-2">
          <p className={`text-5xl font-bold tracking-wider leading-none ${valueColor}`} style={{ fontFamily: 'var(--font-display)' }}>
            {displayValue}
          </p>
          <p className="text-[11px] text-[#94a3b8] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
            {unit === 'percent' ? '%' : mock.unitLabel}
          </p>
        </div>

        {/* Info line */}
        {selected && (
          <p className="text-[10px] text-[#94a3b8] tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            {selected} — {period}
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
            <TrendModule
              title="Tendance par capteur"
              entity="sensor"
            />
            <TrendModule
              title="Tendance par zone"
              entity="zone"
            />
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
