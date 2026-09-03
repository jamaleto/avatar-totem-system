const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export async function buscarVisitante(codigo) {
  const res = await fetch(`${API_BASE}/api/checkin/${codigo}`);
  if (!res.ok) throw new Error("Visitante não encontrado");
  return res.json();
}

export async function listarEstilos() {
  const res = await fetch(`${API_BASE}/api/generate/styles`);
  return res.json();
}

export async function gerarAvatar({ photoBlob, styleId, visitanteId, nome }) {
  const form = new FormData();
  form.append("photo", photoBlob, "photo.jpg");
  form.append("styleId", styleId);
  if (visitanteId) form.append("visitanteId", visitanteId);
  if (nome) form.append("nome", nome);

  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Falha ao gerar avatar");
  return { ...data, imageUrl: `${API_BASE}${data.imageUrl}` };
}

export async function imprimirAvatar(filename) {
  const res = await fetch(`${API_BASE}/api/print`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Falha ao imprimir");
  return data;
}
