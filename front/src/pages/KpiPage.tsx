import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts'

// ─── AQI conversion (EPA PM2.5 breakpoints → AQI) ──────────────────────────────
const PM25_BREAKPOINTS = [
  { aqiLow: 0, aqiHigh: 50, pmLow: 0, pmHigh: 12 },
  { aqiLow: 51, aqiHigh: 100, pmLow: 12.1, pmHigh: 35.4 },
  { aqiLow: 101, aqiHigh: 150, pmLow: 35.5, pmHigh: 55.4 },
  { aqiLow: 151, aqiHigh: 200, pmLow: 55.5, pmHigh: 150.4 },
  { aqiLow: 201, aqiHigh: 300, pmLow: 150.5, pmHigh: 250.4 },
  { aqiLow: 301, aqiHigh: 500, pmLow: 250.5, pmHigh: 500 },
]

export function pm25ToAQI(ug: number): number {
  if (ug <= 0) return 0
  for (const bp of PM25_BREAKPOINTS) {
    if (ug <= bp.pmHigh) {
      return Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.pmHigh - bp.pmLow)) * (ug - bp.pmLow) + bp.aqiLow
      )
    }
  }
  return 500
}

export function aqiToStatus(aqi: number): { label: string; color: string; bg: string; textColor: string } {
  if (aqi <= 50) return { label: 'Bon', color: '#00e5a0', bg: 'bg-[#00e5a0]/10', textColor: 'text-[#00b07d]' }
  if (aqi <= 100) return { label: 'Modéré', color: '#f59e0b', bg: 'bg-amber-50', textColor: 'text-amber-500' }
  if (aqi <= 150) return { label: 'Sensibles', color: '#f97316', bg: 'bg-orange-50', textColor: 'text-orange-500' }
  if (aqi <= 200) return { label: 'Malsain', color: '#ef4444', bg: 'bg-red-50', textColor: 'text-red-500' }
  if (aqi <= 300) return { label: 'Très malsain', color: '#7c3aed', bg: 'bg-purple-50', textColor: 'text-purple-600' }
  return { label: 'Dangereux', color: '#991b1b', bg: 'bg-red-100', textColor: 'text-red-700' }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const AQIDATA_MOCK = [
  { time: '00h', ug: 8.2 }, { time: '02h', ug: 6.9 }, { time: '04h', ug: 5.4 },
  { time: '06h', ug: 11.3 }, { time: '08h', ug: 24.1 }, { time: '10h', ug: 31.7 },
  { time: '12h', ug: 28.4 }, { time: '14h', ug: 22.1 }, { time: '16h', ug: 18.7 },
  { time: '18h', ug: 25.3 }, { time: '20h', ug: 19.2 }, { time: '22h', ug: 12.8 },
]

const NOISEDATA = [
  { time: '00h', value: 42 }, { time: '02h', value: 38 }, { time: '04h', value: 36 },
  { time: '06h', value: 58 }, { time: '08h', value: 72 }, { time: '10h', value: 65 },
  { time: '12h', value: 68 }, { time: '14h', value: 70 }, { time: '16h', value: 66 },
  { time: '18h', value: 75 }, { time: '20h', value: 62 }, { time: '22h', value: 50 },
]

const TRAFFICDATA = [
  { time: '00h', value: 22 }, { time: '02h', value: 15 }, { time: '04h', value: 12 },
  { time: '06h', value: 38 }, { time: '08h', value: 68 }, { time: '10h', value: 55 },
  { time: '12h', value: 50 }, { time: '14h', value: 52 }, { time: '16h', value: 60 },
  { time: '18h', value: 78 }, { time: '20h', value: 45 }, { time: '22h', value: 30 },
]

const WEATHERDATA = [
  { time: '00h', value: 14.2 }, { time: '02h', value: 13.8 }, { time: '04h', value: 13.1 },
  { time: '06h', value: 12.9 }, { time: '08h', value: 15.4 }, { time: '10h', value: 18.2 },
  { time: '12h', value: 20.1 }, { time: '14h', value: 21.5 }, { time: '16h', value: 20.8 },
  { time: '18h', value: 19.2 }, { time: '20h', value: 17.1 }, { time: '22h', value: 15.6 },
]

const ZONEDATA = [
  { zone: 'Centre', ug: 28.4, noise: 68, traffic: 55 },
  { zone: 'Nord', ug: 11.7, noise: 52, traffic: 38 },
  { zone: 'Ouest', ug: 18.3, noise: 61, traffic: 44 },
  { zone: 'Est', ug: 22.1, noise: 57, traffic: 49 },
]

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const LATEST_UG = 28.4
const LATEST_AQI = pm25ToAQI(LATEST_UG)
const AIR_STATUS = aqiToStatus(LATEST_AQI)

const KPI_CARDS = [
  {
    label: 'Qualité de l\'air',
    subLabel: 'μg/m³ PM2.5',
    value: LATEST_UG.toFixed(1),
    unit: 'μg/m³',
    aqi: LATEST_AQI,
    status: AIR_STATUS.label,
    statusColor: AIR_STATUS.textColor,
    statusBg: AIR_STATUS.bg,
    trend: '+3.2',
    trendUp: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    ),
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    label: 'Niveau sonore moyen',
    subLabel: null,
    value: '62',
    unit: 'dB',
    aqi: null,
    status: 'Élevé',
    statusColor: 'text-red-500',
    statusBg: 'bg-red-50 border-red-200',
    trend: '+3',
    trendUp: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
    iconBg: 'bg-red-100 text-red-600',
  },
  {
    label: 'Trafic moyen',
    subLabel: null,
    value: '48',
    unit: 'km/h',
    aqi: null,
    status: 'Fluide',
    statusColor: 'text-[#00b07d]',
    statusBg: 'bg-[#00e5a0]/10 border-[#00e5a0]/30',
    trend: '-7',
    trendUp: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" /><path d="m16 8 4-4v12l-4-4" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    iconBg: 'bg-[#00e5a0]/10 text-[#00b07d]',
  },
  {
    label: 'Température actuelle',
    subLabel: null,
    value: '21',
    unit: '°C',
    aqi: null,
    status: 'Confortable',
    statusColor: 'text-[#00b07d]',
    statusBg: 'bg-[#00e5a0]/10 border-[#00e5a0]/30',
    trend: '+2',
    trendUp: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
      </svg>
    ),
    iconBg: 'bg-orange-100 text-orange-600',
  },
  {
    label: 'Taux de couverture',
    subLabel: null,
    value: '94',
    unit: '%',
    aqi: null,
    status: 'Bon',
    statusColor: 'text-[#00b07d]',
    statusBg: 'bg-[#00e5a0]/10 border-[#00e5a0]/30',
    trend: '+1',
    trendUp: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Alertes actives',
    subLabel: null,
    value: '3',
    unit: '',
    aqi: null,
    status: 'Surveiller',
    statusColor: 'text-orange-500',
    statusBg: 'bg-orange-50 border-orange-200',
    trend: '+2',
    trendUp: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
      </svg>
    ),
    iconBg: 'bg-orange-100 text-orange-600',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ kpi }: { kpi: typeof KPI_CARDS[0] }) {
  return (
    <Card className="p-5 min-w-0">
      <CardContent className="p-0 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
            {kpi.icon}
          </div>
          <span className={`text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md border shrink-0 ${kpi.statusBg} ${kpi.statusColor}`}
            style={{ fontFamily: 'var(--font-mono)' }}>
            {kpi.status}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-[#94a3b8] tracking-[0.15em] uppercase mb-0.5 truncate"
            style={{ fontFamily: 'var(--font-mono)' }}>
            {kpi.label}
          </p>
          {kpi.subLabel && (
            <p className="text-[9px] text-[#94a3b8] truncate" style={{ fontFamily: 'var(--font-mono)' }}>
              {kpi.subLabel}
            </p>
          )}
          <div className="flex items-baseline gap-1 mt-1 flex-wrap">
            <span className="text-3xl font-bold tracking-wider text-[#0d0f14] leading-none"
              style={{ fontFamily: 'var(--font-display)' }}>
              {kpi.value}
            </span>
            <span className="text-xs text-[#94a3b8] shrink-0">{kpi.unit}</span>
            {kpi.aqi !== null && (
              <span className="text-[10px] font-semibold shrink-0" style={{ color: aqiToStatus(kpi.aqi).color, fontFamily: 'var(--font-mono)' }}>
                AQI {kpi.aqi}
              </span>
            )}
            <span className={`ml-auto text-[10px] font-semibold tracking-wider shrink-0 ${kpi.trendUp ? 'text-red-500' : 'text-[#00b07d]'}`}
              style={{ fontFamily: 'var(--font-mono)' }}>
              {kpi.trendUp ? '↑' : '↓'} {kpi.trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TrendChart({ data, color, unit, dataKey = 'value' }: {
  data: Record<string, string | number>[]; color: string; unit: string; dataKey?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
          axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
          axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, fontFamily: 'var(--font-mono)' }}
          formatter={(v) => [`${v} ${unit}`, '']}
        />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
          fill={`url(#grad-${color.replace('#', '')})`} dot={false} activeDot={{ r: 4, fill: color }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function AqiGauge({ ug }: { ug: number }) {
  const aqi = pm25ToAQI(ug)
  const status = aqiToStatus(aqi)
  const pct = Math.min((ug / 500) * 100, 100)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle cx="60" cy="60" r="52" fill="none" stroke={status.color} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 52 * pct / 100} ${2 * Math.PI * 52}`}
            strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#0d0f14] leading-none" style={{ fontFamily: 'var(--font-display)' }}>{aqi}</span>
          <span className="text-[10px] text-[#94a3b8]" style={{ fontFamily: 'var(--font-mono)' }}>AQI</span>
        </div>
      </div>
      <div className="text-center">
        <Badge className="border text-[10px] tracking-wider uppercase"
          style={{ background: `${status.color}20`, borderColor: status.color, color: status.color, fontFamily: 'var(--font-mono)' }}>
          {status.label}
        </Badge>
        <p className="mt-1 text-[10px] text-[#94a3b8]" style={{ fontFamily: 'var(--font-mono)' }}>
          {ug} μg/m³
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
        <p className="mt-2 text-xs text-[#94a3b8] tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>
          Connexion API en attente
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 mb-8">
        {KPI_CARDS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Air quality */}
        <Card className="p-5">
          <CardContent className="p-0">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div>
                <p className="text-[10px] text-[#94a3b8] tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                  Qualité de l&apos;air
                </p>
                <p className="text-base font-bold text-[#0d0f14] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  PM2.5 · μg/m³ · 24h
                </p>
              </div>
              <Badge className="text-[10px] tracking-wider uppercase shrink-0"
                style={{ background: `${AIR_STATUS.color}20`, borderColor: AIR_STATUS.color, color: AIR_STATUS.color, fontFamily: 'var(--font-mono)' }}>
                AQI {LATEST_AQI} · {AIR_STATUS.label}
              </Badge>
            </div>
            <TrendChart data={AQIDATA_MOCK} color="#f59e0b" unit="μg/m³" dataKey="ug" />
            <div className="mt-2 flex gap-3 flex-wrap">
              {[
                { label: 'Bon (0–12)', color: '#00e5a0' },
                { label: 'Modéré (12–35)', color: '#f59e0b' },
                { label: 'Malsain (35+)', color: '#ef4444' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                  <span className="text-[9px] text-[#94a3b8] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Noise */}
        <Card className="p-5">
          <CardContent className="p-0">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div>
                <p className="text-[10px] text-[#94a3b8] tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                  Niveau sonore
                </p>
                <p className="text-base font-bold text-[#0d0f14] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  Bruit ambiant · 24h
                </p>
              </div>
              <Badge className="text-[10px] tracking-wider uppercase shrink-0 bg-red-50 text-red-600 border-red-200"
                style={{ fontFamily: 'var(--font-mono)' }}>
                ⚠ Seuil : 70 dB
              </Badge>
            </div>
            <TrendChart data={NOISEDATA} color="#ef4444" unit="dB" />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} />
          </CardContent>
        </Card>

        {/* Traffic */}
        <Card className="p-5">
          <CardContent className="p-0">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div>
                <p className="text-[10px] text-[#94a3b8] tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                  Trafic
                </p>
                <p className="text-base font-bold text-[#0d0f14] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  Vitesse moyenne · 24h
                </p>
              </div>
              <Badge className="text-[10px] tracking-wider uppercase shrink-0 bg-[#00e5a0]/10 text-[#00b07d] border-[#00e5a0]/30"
                style={{ fontFamily: 'var(--font-mono)' }}>
                ✓ Normal
              </Badge>
            </div>
            <TrendChart data={TRAFFICDATA} color="#00b07d" unit="km/h" />
          </CardContent>
        </Card>

        {/* Weather */}
        <Card className="p-5">
          <CardContent className="p-0">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div>
                <p className="text-[10px] text-[#94a3b8] tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                  Météo
                </p>
                <p className="text-base font-bold text-[#0d0f14] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  Température · 24h
                </p>
              </div>
              <Badge className="text-[10px] tracking-wider uppercase shrink-0 bg-orange-50 text-orange-600 border-orange-200"
                style={{ fontFamily: 'var(--font-mono)' }}>
                Confortable
              </Badge>
            </div>
            <TrendChart data={WEATHERDATA} color="#f97316" unit="°C" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: AQI Gauge + Zone comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* AQI Gauge */}
        <Card className="p-5">
          <CardContent className="p-0 flex flex-col items-center">
            <p className="text-[10px] text-[#94a3b8] tracking-[0.15em] uppercase mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
              Indice de qualité de l&apos;air
            </p>
            <AqiGauge ug={LATEST_UG} />
            <div className="mt-4 w-full">
              <div className="flex justify-between text-[9px] text-[#94a3b8] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                <span>0</span><span>12</span><span>35</span><span>55</span><span>150</span><span>250+</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden flex">
                <div className="h-full bg-[#00e5a0]" style={{ flex: 12 }} />
                <div className="h-full bg-[#f59e0b]" style={{ flex: 23 }} />
                <div className="h-full bg-[#f97316]" style={{ flex: 20 }} />
                <div className="h-full bg-[#ef4444]" style={{ flex: 95 }} />
                <div className="h-full bg-[#7c3aed]" style={{ flex: 100 }} />
              </div>
              <div className="flex justify-between text-[9px] text-[#94a3b8] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                <span>AQI 0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone comparison */}
        <Card className="p-5 lg:col-span-2">
          <CardContent className="p-0">
            <p className="text-[10px] text-[#94a3b8] tracking-[0.15em] uppercase mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
              Comparaison par zone
            </p>
            <p className="text-base font-bold text-[#0d0f14] tracking-wider mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              μg/m³ · dB · km/h
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={ZONEDATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, fontFamily: 'var(--font-mono)' }}
                  formatter={(v, name) => {
                    if (name === 'ug') return [`${v} μg/m³`, 'Air']
                    if (name === 'noise') return [`${v} dB`, 'Bruit']
                    return [`${v} km/h`, 'Trafic']
                  }}
                />
                <Line type="monotone" dataKey="ug" stroke="#f59e0b" strokeWidth={2}
                  dot={{ r: 4, fill: '#f59e0b' }} name="ug" />
                <Line type="monotone" dataKey="noise" stroke="#ef4444" strokeWidth={2}
                  dot={{ r: 4, fill: '#ef4444' }} name="noise" />
                <Line type="monotone" dataKey="traffic" stroke="#00b07d" strokeWidth={2}
                  dot={{ r: 4, fill: '#00b07d' }} name="trafic" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex gap-3 flex-wrap">
              {[
                { label: 'Air μg/m³', color: '#f59e0b' },
                { label: 'Bruit dB', color: '#ef4444' },
                { label: 'Trafic km/h', color: '#00b07d' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                  <span className="text-[9px] text-[#94a3b8] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API pending */}
      <div className="mt-6 flex items-center justify-center gap-2 py-3 border-t border-[#e2e8f0]">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-[10px] text-[#94a3b8] tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          DONNÉES TEMPLATE — AIR = μg/m³ → AQI EPA PM2.5 — CONNEXION API À CONFIGURER
        </p>
      </div>
    </div>
  )
}

export default KpiPage
