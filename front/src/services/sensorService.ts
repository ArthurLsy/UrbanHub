import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export const fetchSensorStatusCount = async (alive: boolean): Promise<number> => {
  const { data } = await axios.get<number>(`${API_URL}/api/sensors/status/count`, {
    params: { alive },
  })
  return data
}
