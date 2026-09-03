import { useState } from "react";
import { imprimirAvatar } from "../api/client.js";

export default function ResultScreen({ resultado, onRestart }) {
  const [status, setStatus] = useState("idle"); // idle | printing | done | error

  async function handlePrint() {
    setStatus("printing");
    try {
      await imprimirAvatar(resultado.filename);
      setStatus("done");
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div className="screen">
      <p className="eyebrow">PRONTO</p>
      <h1 className="headline">Seu avatar ficou assim</h1>

      <div className="center-column" style={{ flex: "unset" }}>
        <img src={resultado.imageUrl} alt="Avatar gerado" className="result-image" />
      </div>

      {status === "error" && (
        <div className="error-box">
          Não foi possível imprimir. Verifique se a impressora está ligada e tente novamente.
        </div>
      )}
      {status === "done" && (
        <div className="error-box" style={{ borderColor: "var(--accent-mint)", color: "var(--accent-mint)", background: "rgba(143,227,192,0.1)" }}>
          Impresso! Retire sua foto na bandeja da impressora.
        </div>
      )}

      <div className="action-row">
        <button className="btn-primary" onClick={handlePrint} disabled={status === "printing" || status === "done"}>
          {status === "printing" ? "Imprimindo..." : status === "done" ? "Impresso ✓" : "Imprimir"}
        </button>
        <button className="btn-secondary" onClick={onRestart}>
          Concluir
        </button>
      </div>
    </div>
  );
}
