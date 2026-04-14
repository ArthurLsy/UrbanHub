import axios from 'axios'
import type { Zone, CreateZonePayload } from '../types'

export const fetchZones = async (): Promise<Zone[]> => {
  const { data } = await axios.get<Zone[]>('/api/zones')
  return data
}

export const createZone = async (payload: CreateZonePayload): Promise<Zone> => {
  const { data } = await axios.post<Zone>('/api/zones', payload)
  return data
}
