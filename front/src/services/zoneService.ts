import axios from 'axios'
import type { Zone } from '../types'

export const fetchZones = async (): Promise<Zone[]> => {
  const { data } = await axios.get<Zone[]>('http://localhost:8080/api/zones')
  return data
}

export const fetchZoneById = async (id: string): Promise<Zone> => {
  const { data } = await axios.get<Zone>(`http://localhost:8080/api/zones/${id}`)
  return data
}
