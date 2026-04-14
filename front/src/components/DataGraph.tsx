import { LineChart, CartesianGrid, Line, XAxis, YAxis, Tooltip } from 'recharts'
import type { Measure } from '../types'

const DataGraph = ({ data }: { data: Measure[] }) => {
  return (
    <LineChart
      style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
      data={data}
    >
      <CartesianGrid />
      <XAxis dataKey="timestamp" />
      <YAxis dataKey="value" />
      <Tooltip />
      <Line dataKey="value" stroke="#00e5a0" dot={false} />
    </LineChart>
  )
}

export default DataGraph
