import axios from 'axios'
import type { SensorType } from '../types'

export const fetchSensorTypes = async (): Promise<SensorType[]> => {
  const { data } = await axios.get<SensorType[]>('/api/sensor-types')
  return data
}

export const fetchSensorTypesCount = async (): Promise<number> => {
  const { data } = await axios.get<number>('/api/sensor-types/count')
  return data
}

export const fetchSensorTypeById = async (sensorTypeId: string): Promise<SensorType> => {
  const { data } = await axios.get<SensorType>('/api/sensor-types/by-id', {
    params: { sensor_type_id: sensorTypeId },
  })
  return data
}
