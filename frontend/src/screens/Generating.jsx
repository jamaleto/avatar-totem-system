import { useEffect, useRef, useState } from "react";
import { gerarAvatar } from "../api/client.js";

export default function Generating({ photoBlob, styleId, visitante, onDone, onError }) {
  const [msg, setMsg] = useState("Analisando sua foto...");
  const started = useRef(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setMsg("Aplicando o estilo escolhido..."), 1500),
      setTimeout(() => setMsg("Finalizando os detalhes..."), 3500),
    ];

    if (!started.current) {
      started.current = true;
      gerarAvatar({
        photoBlob,
        styleId,
        visitanteId: visitante?.id,
        nome: visitante?.nome,
      })
        .then(onDone)
        .catch(onError);
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="screen">
      <div className="center-column">
        <div className="spinner" />
        <h1 className="headline" style={{ fontSize: 30 }}>
          Gerando seu avatar
        </h1>
        <p className="subtext">{msg}</p>
      </div>
    </div>
  );
}
