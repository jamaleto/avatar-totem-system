// Vazio = mesma origem (funciona direto no deploy do Vercel, onde o
// backend serverless mora em /api dentro do próprio projeto). Para rodar
// contra o backend Express local (com impressão e credenciamento), defina
// VITE_API_BASE=http://localhost:3001 no frontend/.env.
const API_BASE = import.meta.env.VITE_API_BASE || "";

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

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
  const imageBase64 = await blobToBase64(photoBlob);

  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, styleId, visitanteId, nome }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Falha ao gerar avatar");

  // No backend local (Express), a resposta traz imageUrl (arquivo salvo em
  // disco). No backend serverless (Vercel), traz imageBase64 direto. Este
  // client aceita os dois formatos.
  const imageUrl = data.imageUrl
    ? `${API_BASE}${data.imageUrl}`
    : data.imageBase64;

  return { ...data, imageUrl };
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
