import axios from 'axios'
import type { Mesure } from '../types'

export const fetchMesures = async (): Promise<Mesure[]> => {
  const { data } = await axios.get<Mesure[]>('http://localhost:8080/api/mesures')
  return data
}

export const fetchMesureById = async (id: string): Promise<Mesure> => {
  const { data } = await axios.get<Mesure>(`http://localhost:8080/api/mesures/${id}`)
  return data
}

export const fetchMesuresByCapteurId = async (capteurId: string): Promise<Mesure[]> => {
  const { data } = await axios.get<Mesure[]>('http://localhost:8080/api/mesures', { params: { capteur_id: capteurId } })
  return data
}
