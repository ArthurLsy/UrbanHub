import axios from 'axios'

export type SensorDto = {
  uuid: string
  sensorId: string
  sensorTypeId: string
  latitude: number
  longitude: number
  status: boolean
  zoneId: string | null
}

const API_URL = import.meta.env.VITE_API_URL || ''

export const fetchSensors = async (): Promise<SensorDto[]> => {
  const { data } = await axios.get<SensorDto[]>(`${API_URL}/api/sensors`)
  return data
}

export const fetchSensorsByType = async (type: string): Promise<SensorDto[]> => {
  const { data } = await axios.get<SensorDto[]>(`${API_URL}/api/sensors`, {
    params: { type },
  })
  return data
}

export const fetchSensorCount = async (): Promise<number> => {
  const { data } = await axios.get<number>(`${API_URL}/api/sensors/count`)
  return data
}