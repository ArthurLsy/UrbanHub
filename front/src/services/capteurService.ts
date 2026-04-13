import axios from 'axios'
import type { Capteur } from '../types'

export const fetchCapteurs = async (): Promise<Capteur[]> => {
  const { data } = await axios.get<Capteur[]>('http://localhost:8080/api/capteurs')
  return data
}

export const fetchCapteurById = async (id: string): Promise<Capteur> => {
  const { data } = await axios.get<Capteur>(`http://localhost:8080/api/capteurs/${id}`)
  return data
}
