import { useQuery } from '@tanstack/react-query'
import { fetchMeasures, fetchMeasuresBySensorId } from '../services/measureService'

export const useMeasures = () => {
  return useQuery({
    queryKey: ['measures'],
    queryFn: fetchMeasures,
  })
}

export const useMeasuresBySensor = (sensorId: string) => {
  return useQuery({
    queryKey: ['measures', sensorId],
    queryFn: () => fetchMeasuresBySensorId(sensorId),
  })
}
