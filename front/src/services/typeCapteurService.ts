import axios from 'axios'
import type { TypeCapteur } from '../types'

export const fetchTypesCapteur = async (): Promise<TypeCapteur[]> => {
  const { data } = await axios.get<TypeCapteur[]>('http://localhost:8080/api/types-capteur')
  return data
}

export const fetchTypeCapteurById = async (id: string): Promise<TypeCapteur> => {
  const { data } = await axios.get<TypeCapteur>(`http://localhost:8080/api/types-capteur/${id}`)
  return data
}
