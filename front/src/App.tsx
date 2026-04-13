import "./App.css";
import DataGraph from "./components/DataGraph";
import type { Mesure } from "./types";

function App() {
  const data: Mesure[] = [
    { mesure_id: "1", horodatage: "2026-04-01", capteur_id: "C1", valeur: 22.5, unite: "°C" },
    { mesure_id: "2", horodatage: "2026-04-02", capteur_id: "C1", valeur: 23.1, unite: "°C" },
    { mesure_id: "3", horodatage: "2026-04-03", capteur_id: "C1", valeur: 21.8, unite: "°C" },
    { mesure_id: "4", horodatage: "2026-04-04", capteur_id: "C1", valeur: 24.2, unite: "°C" },
    { mesure_id: "5", horodatage: "2026-04-05", capteur_id: "C1", valeur: 25.0, unite: "°C" },
  ];

  return (
    <>
      <DataGraph data={data} />
    </>
  );
}

export default App;
