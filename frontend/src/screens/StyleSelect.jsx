import { useEffect, useState } from "react";
import { listarEstilos } from "../api/client.js";

export default function StyleSelect({ onSelect }) {
  const [estilos, setEstilos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    listarEstilos().then(setEstilos).catch(() => setEstilos([]));
  }, []);

  return (
    <div className="screen">
      <p className="eyebrow">PASSO 2</p>
      <h1 className="headline">Escolha um estilo</h1>
      <p className="subtext">
        Selecione como sua versão gerada por IA vai ficar.
      </p>

      <div className="style-grid">
        {estilos.map((estilo) => (
          <button
            key={estilo.id}
            className={`style-card ${selecionado === estilo.id ? "selected" : ""}`}
            onClick={() => setSelecionado(estilo.id)}
          >
            {estilo.label}
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        style={{ marginTop: 32 }}
        disabled={!selecionado}
        onClick={() => onSelect(selecionado)}
      >
        Continuar
      </button>
    </div>
  );
}
