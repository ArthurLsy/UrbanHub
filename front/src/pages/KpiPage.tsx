import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useSensors } from '@/queries/sensorQueries'
import { useZones } from '@/queries/zoneQueries'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type Period = '1h' | '24h' | '1week'
type Unit = 'percent' | 'unit'
type Selector = 'zone' | 'sensorType' | 'sensor'
type Granularity = '1h' | '24h' | '1week'

const PERIODS: { value: Period; label: string }[] = [
  { value: '1h', label: '1 heure' },
  { value: '24h', label: '24 heures' },
  { value: '1week', label: '1 semaine' },
]

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '24h', label: '24h' },
  { value: '1week', label: '1 semaine' },
]

// mock bar chart data
const MOCK_BARS = [
  { label: 'Lun', air: 42, noise: 55, traffic: 38 },
  { label: 'Mar', air: 38, noise: 51, traffic: 42 },
  { label: 'Mer', air: 45, noise: 58, traffic: 35 },
  { label: 'Jeu', air: 51, noise: 62, traffic: 48 },
  { label: 'Ven', air: 48, noise: 60, traffic: 55 },
  { label: 'Sam', air: 35, noise: 48, traffic: 40 },
  { label: 'Dim', air: 30, noise: 44, traffic: 28 },
]

function MoyenneModule() {
  const { data: sensors } = useSensors()
  const { data: zones } = useZones()

  const [selector, setSelector] = useState<Selector>('zone')
  const [selectedId, setSelectedId] = useState<string>('')
  const [granularity, setGranularity] = useState<Granularity>('1week')
  const [dateFrom, setDateFrom] = useState<string>('2026-04-01')
  const [dateTo, setDateTo] = useState<string>('2026-04-15')

  const selectorOptions = selector === 'zone'
    ? (zones ?? []).map(z => ({ value: z.zoneId, label: z.zoneId }))
    : selector === 'sensorType'
      ? Array.from(new Set((sensors ?? []).map((s: { sensorTypeId: string }) => s.sensorTypeId))).map(t => ({ value: t, label: t }))
      : (sensors ?? []).map(s => ({ value: s.sensorId, label: s.sensorId }))

  const selectedLabel = selectorOptions.find(o => o.value === selectedId)?.label ?? ''

  return (
    <Card className="p-6">
      <CardContent className="p-0 flex flex-col gap-5">
        {/* Filters row */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#94a3b8] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Sélectionner
            </label>
            <ToggleGroup
              type="single"
              value={selector}
              onValueChange={(v) => {
                if (v) {
                  setSelector(v as Selector)
                  setSelectedId('')
                }
              }}
            >
              <ToggleGroupItem value="zone" variant="outline" className="h-8 px-3 text-xs">
                Zone
              </ToggleGroupItem>
              <ToggleGroupItem value="sensorType" variant="outline" className="h-8 px-3 text-xs">
                Type
              </ToggleGroupItem>
              <ToggleGroupItem value="sensor" variant="outline" className="h-8 px-3 text-xs">
                Capteur
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-[10px] text-[#94a3b8] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              {selector === 'zone' ? 'Zone' : selector === 'sensorType' ? 'Type de capteur' : 'Capteur'}
            </label>
            <Combobox
              options={selectorOptions}
              value={selectedId}
              onChange={setSelectedId}
              placeholder="Rechercher..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#94a3b8] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Granularité
            </label>
            <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
              <SelectTrigger className="h-11 text-sm w-full min-w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRANULARITIES.map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#94a3b8] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Du
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-11 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#00e5a0]"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#94a3b8] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Au
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-11 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#00e5a0]"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>

        {/* Bar chart */}
        <div className="w-full rounded-xl border border-[#e2e8f0] bg-white p-4">
          {selectedId ? (
            <>
              <p className="text-[11px] text-[#94a3b8] tracking-wider uppercase mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                Moyenne — {selectedLabel} — {granularity === '1h' ? 'par heure' : granularity === '24h' ? 'par jour' : 'par semaine'}
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_BARS} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
                    axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, fontFamily: 'var(--font-mono)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8' }} />
                  <Bar dataKey="air" fill="#f59e0b" name="Air (μg/m³)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="noise" fill="#ef4444" name="Bruit (dB)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="traffic" fill="#00b07d" name="Trafic (km/h)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="flex items-center justify-center h-[280px]">
              <p className="text-xs text-[#94a3b8] italic tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                Sélectionnez une {selector === 'zone' ? 'zone' : selector === 'sensorType' ? 'type de capteur' : 'capteur'} pour voir la moyenne
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

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
        <div className="w-full rounded-xl border-[#e2e8f0] bg-white flex flex-row items-center justify-center py-8 px-4 mt-2">
          <p className={`text-5xl font-bold tracking-wider leading-none ${valueColor}`} style={{ fontFamily: 'var(--font-display)' }}>
            {displayValue}
          </p>
          <p className="text-[14px] text-[#94a3b8] ml-2 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
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
          <MoyenneModule />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default KpiPage