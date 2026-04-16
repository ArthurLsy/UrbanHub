import { useQuery } from '@tanstack/react-query'
import { fetchSensorStatusCount, fetchSensors } from '../services/sensorService'

export const useSensors = () => {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: fetchSensors,
  })
}

export const useSensorStatusCount = (alive: boolean) => {
  return useQuery({
    queryKey: ['sensors', 'status', 'count', alive],
    queryFn: () => fetchSensorStatusCount(alive),
  })
}
