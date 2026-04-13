import axios from 'axios'

export type ChartData = {
  // TODO: typer selon la réponse du backend
  labels: string[]
  values: number[]
}

export const fetchChartData = async (): Promise<ChartData> => {
  const { data } = await axios.get<ChartData>('http://localhost:8080/api/chart')
  return data
}
