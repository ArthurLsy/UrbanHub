import { useQuery } from '@tanstack/react-query'
import { fetchSensorStatusCount } from '../services/sensorService'

export const useSensorStatusCount = (alive: boolean) => {
  return useQuery({
    queryKey: ['sensors', 'status', 'count', alive],
    queryFn: () => fetchSensorStatusCount(alive),
  })
}
