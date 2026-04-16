import { useQuery } from '@tanstack/react-query'
import { fetchSensorTypes, fetchSensorTypesCount, fetchSensorTypeById } from '../services/sensorTypeService'

export const useSensorTypes = () => {
  return useQuery({
    queryKey: ['sensor-types'],
    queryFn: fetchSensorTypes,
  })
}

export const useSensorTypesCount = () => {
  return useQuery({
    queryKey: ['sensor-types', 'count'],
    queryFn: fetchSensorTypesCount,
  })
}

export const useSensorTypeById = (sensorTypeId: string) => {
  return useQuery({
    queryKey: ['sensor-types', sensorTypeId],
    queryFn: () => fetchSensorTypeById(sensorTypeId),
    enabled: !!sensorTypeId,
  })
}
