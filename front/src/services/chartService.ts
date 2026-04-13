import axios from 'axios'
import type { Mesure } from '../types'

export const fetchMesures = async (): Promise<Mesure[]> => {
  const { data } = await axios.get<Mesure[]>('http://localhost:8080/api/mesures')
  return data
}
