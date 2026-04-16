import axios from 'axios'
import type { Sensor } from '../types'

const API_URL = import.meta.env.VITE_API_URL || ''

type SensorApiDto = {
  uuid: string
  sensorId: string
  sensorTypeId: string
  status: boolean
}

export const fetchSensors = async (): Promise<Sensor[]> => {
  const { data } = await axios.get<SensorApiDto[]>(`${API_URL}/api/sensors`)
  return data.map((s) => ({
    sensorId: s.sensorId,
    sensorTypeId: s.sensorTypeId,
    sensorStatus: s.status,
    latitude: 0,
    longitude: 0,
    zoneId: '',
  }))
}

export const fetchSensorStatusCount = async (alive: boolean): Promise<number> => {
  const { data } = await axios.get<number>(`${API_URL}/api/sensors/status/count`, {
    params: { alive },
  })
  return data
}
