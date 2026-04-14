import { useState, useMemo } from 'react'
import { Plus, MapPin, Cpu, AlertTriangle } from 'lucide-react'
import { useZones, useCreateZone } from '../queries/zoneQueries'
import { useMeasures } from '../queries/measureQueries'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const ZonesPage = () => {
  const { data: zones, isLoading, isError } = useZones()
  const { data: measures } = useMeasures()
  const createZone = useCreateZone()

  const [open, setOpen] = useState(false)
  const [zoneName, setZoneName] = useState('')
  const [selectedSensors, setSelectedSensors] = useState<string[]>([])
  const [searchSensor, setSearchSensor] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Deduplicated sensor list from measures
  const availableSensors = useMemo(() => {
    if (!measures) return []
    const map = new Map<string, { sensorId: string; sensorTypeId: string }>()
    measures.forEach((m) => {
      if (!map.has(m.sensorId)) {
        map.set(m.sensorId, { sensorId: m.sensorId, sensorTypeId: m.sensorTypeId })
      }
    })
    return Array.from(map.values())
  }, [measures])

  const filteredSensors = useMemo(() => {
    if (!searchSensor.trim()) return availableSensors
    return availableSensors.filter(
      (s) =>
        s.sensorId.toLowerCase().includes(searchSensor.toLowerCase()) ||
        s.sensorTypeId.toLowerCase().includes(searchSensor.toLowerCase())
    )
  }, [availableSensors, searchSensor])

  const toggleSensor = (sensorId: string) => {
    setSelectedSensors((prev) =>
      prev.includes(sensorId) ? prev.filter((id) => id !== sensorId) : [...prev, sensorId]
    )
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setZoneName('')
      setSelectedSensors([])
      setSearchSensor('')
      setSubmitError(null)
    }
  }

  const handleCreate = async () => {
    if (!zoneName.trim()) {
      setSubmitError('Le nom de la zone est requis.')
      return
    }
    setSubmitError(null)
    try {
      await createZone.mutateAsync({ zoneId: zoneName.trim(), sensorIds: selectedSensors })
      handleOpenChange(false)
    } catch {
      setSubmitError("Impossible de créer la zone. Veuillez réessayer.")
    }
  }

  const isUnavailable = !isLoading && !isError && (!zones || zones.length === 0)

  return (
    <div>
      {/* Header */}
      <header className="mb-10 flex items-start justify-between">
        <div>
          <p
            className="text-[12px] text-[#00b07d] tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Périmètres urbains
          </p>
          <h1
            className="text-5xl font-bold tracking-wider text-[#0d0f14] uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Zones
          </h1>
          <div className="mt-4 h-1 w-20 bg-[#00e5a0]" />
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="mt-2 flex items-center gap-2 bg-[#00e5a0] text-[#0d0f14] hover:bg-[#00e5a0]/90 shadow-md"
        >
          <Plus className="h-4 w-4" />
          Nouvelle zone
        </Button>
      </header>

      {/* Content card */}
      <Card>
        <CardContent className="p-8">
          {isLoading && (
            <p
              className="text-sm text-[#94a3b8] tracking-wider animate-pulse"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Chargement des zones...
            </p>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100">
                <AlertTriangle className="h-8 w-8 text-amber-400" />
              </div>
              <p
                className="text-lg font-semibold tracking-wider text-[#94a3b8] uppercase text-center"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Pas encore disponible
              </p>
              <p
                className="text-xs text-[#94a3b8] tracking-wider text-center max-w-xs"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                L'API des zones n'est pas encore accessible. Réessayez plus tard.
              </p>
            </div>
          )}

          {isUnavailable && !isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <MapPin className="h-8 w-8 text-[#cbd5e1]" />
              </div>
              <p
                className="text-lg font-semibold tracking-wider text-[#94a3b8] uppercase text-center"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Aucune zone définie
              </p>
              <p
                className="text-xs text-[#94a3b8] tracking-wider text-center max-w-xs"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Créez votre première zone pour regrouper vos capteurs par périmètre urbain.
              </p>
              <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="mt-2"
              >
                <Plus className="h-4 w-4" />
                Créer une zone
              </Button>
            </div>
          )}

          {zones && zones.length > 0 && (
            <>
              <p
                className="text-xs text-[#94a3b8] tracking-wider mb-4"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {zones.length} zone(s) trouvée(s)
              </p>
              <ul className="flex flex-col gap-3">
                {zones.map((zone) => (
                  <li
                    key={zone.uuid ?? zone.zoneId}
                    className="flex items-center justify-between px-5 py-4 rounded-lg border border-[#e2e8f0] hover:border-[#00e5a0]/50 hover:bg-[#f8fafc] transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00e5a0]/10">
                        <MapPin className="h-4 w-4 text-[#00b07d]" />
                      </div>
                      <span
                        className="text-base font-semibold tracking-wider text-[#1e293b] uppercase"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {zone.zoneId}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {zone.sensors && zone.sensors.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]" style={{ fontFamily: 'var(--font-mono)' }}>
                          <Cpu className="h-3.5 w-3.5" />
                          {zone.sensors.length} capteur(s)
                        </div>
                      )}
                      <Badge className="bg-[#f1f5f9] text-[#64748b]">
                        {zone.sensors?.length ?? 0} capteur(s)
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Zone Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-display)' }}>
              Nouvelle zone
            </DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-mono)' }}>
              Définissez un périmètre urbain et associez-y des capteurs.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-2">
            {/* Zone name */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[11px] text-[#94a3b8] tracking-[0.15em] uppercase"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Nom de la zone <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="ex : Zone Nord, Quartier Vaugueux…"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Sensor selector */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[11px] text-[#94a3b8] tracking-[0.15em] uppercase"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Capteurs associés{' '}
                {selectedSensors.length > 0 && (
                  <span className="ml-1 text-[#00b07d]">({selectedSensors.length} sélectionné(s))</span>
                )}
              </label>

              {/* Search */}
              <Input
                placeholder="Rechercher un capteur…"
                value={searchSensor}
                onChange={(e) => setSearchSensor(e.target.value)}
                className="h-9 text-sm"
              />

              {/* List */}
              <div className="max-h-52 overflow-y-auto rounded-xl border border-[#e2e8f0] divide-y divide-[#f1f5f9]">
                {filteredSensors.length === 0 && (
                  <p
                    className="text-xs text-[#94a3b8] text-center py-6 tracking-wider"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Aucun capteur disponible
                  </p>
                )}
                {filteredSensors.map((sensor) => (
                  <label
                    key={sensor.sensorId}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                  >
                    <Checkbox
                      id={`sensor-${sensor.sensorId}`}
                      checked={selectedSensors.includes(sensor.sensorId)}
                      onCheckedChange={() => toggleSensor(sensor.sensorId)}
                    />
                    <div className="flex flex-col">
                      <span
                        className="text-sm font-semibold text-[#1e293b] tracking-wider uppercase"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {sensor.sensorId}
                      </span>
                      <span
                        className="text-xs text-[#94a3b8] tracking-wider"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {sensor.sensorTypeId}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {submitError && (
              <p
                className="text-xs text-red-500 tracking-wider"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {submitError}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createZone.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createZone.isPending || !zoneName.trim()}
              className="bg-[#00e5a0] text-[#0d0f14] hover:bg-[#00e5a0]/90"
            >
              {createZone.isPending ? 'Création…' : 'Créer la zone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ZonesPage