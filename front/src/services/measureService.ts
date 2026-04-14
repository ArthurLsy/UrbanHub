import axios from 'axios'
import type { Measure } from '../types'

export const fetchMeasures = async (): Promise<Measure[]> => {
  const { data } = await axios.get<Measure[]>('/api/measures')
  return data
}

export const fetchMeasuresBySensorId = async (sensorId: string): Promise<Measure[]> => {
  const { data } = await axios.get<Measure[]>('/api/measures', { params: { sensor_id: sensorId } })
  return data
}
