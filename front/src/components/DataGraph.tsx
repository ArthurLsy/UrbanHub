import { LineChart, CartesianGrid, Line, XAxis, YAxis, Tooltip } from "recharts";
import type { Mesure } from "../types";

const DataGraph = ({ data }: { data: Mesure[] }) => {
  return (
    <LineChart
      style={{ width: "100%", aspectRatio: 1.618, maxWidth: 600 }}
      responsive
      data={data}
    >
      <CartesianGrid />
      <XAxis dataKey="horodatage" />
      <YAxis dataKey="valeur" />
      <Tooltip />
      <Line dataKey="valeur" stroke="#8884d8" />
    </LineChart>
  );
};

export default DataGraph;
