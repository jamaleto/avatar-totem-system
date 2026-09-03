import { useState } from "react";
import { buscarVisitante } from "../api/client.js";

/**
 * Em produção, o ideal é um leitor de QR code/código de barras USB
 * conectado ao totem — ele "digita" o código automaticamente neste
 * campo, sem precisar de teclado. Este componente já funciona assim
 * (basta o leitor estar focado neste input) e também aceita digitação
 * manual como fallback.
 */
export default function CodeEntryScreen({ onFound, onSkip }) {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!codigo.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const visitante = await buscarVisitante(codigo.trim());
      onFound(visitante);
    } catch (err) {
      setError("Código não encontrado. Confira o badge e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <p className="eyebrow">PASSO 1</p>
      <h1 className="headline">Escaneie seu badge</h1>
      <p className="subtext">
        Aproxime o código do seu credenciamento do leitor, ou digite abaixo.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 28 }}>
        <input
          autoFocus
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Código do badge"
          style={{
            width: "100%",
            fontSize: 22,
            padding: "18px 20px",
            borderRadius: 16,
            border: "2px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text)",
          }}
        />
        {error && <div className="error-box">{error}</div>}

        <div className="action-row">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Buscando..." : "Continuar"}
          </button>
          <button type="button" className="btn-secondary" onClick={onSkip}>
            Pular
          </button>
        </div>
      </form>
    </div>
  );
}
