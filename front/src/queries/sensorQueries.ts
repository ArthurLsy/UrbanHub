import { useQuery } from '@tanstack/react-query'
import { fetchSensors, fetchSensorsByType, fetchSensorCount } from '../services/sensorService'

export const useSensors = () => {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: fetchSensors,
  })
}

export const useSensorsByType = (type: string) => {
  return useQuery({
    queryKey: ['sensors', type],
    queryFn: () => fetchSensorsByType(type),
    enabled: !!type,
  })
}

export const useSensorCount = () => {
  return useQuery({
    queryKey: ['sensors', 'count'],
    queryFn: fetchSensorCount,
  })
}