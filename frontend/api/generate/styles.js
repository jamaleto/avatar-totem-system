// Mantenha esta lista sincronizada com backend/src/services/aiService.js
// (aquele arquivo é usado na versão que roda localmente no dia do evento,
// este aqui é a versão serverless só para testes online no Vercel).
const AVATAR_STYLES = [
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "classico", label: "Retrato Clássico" },
  { id: "aquarela", label: "Aquarela" },
  { id: "heroi", label: "Herói" },
];

export default function handler(req, res) {
  res.status(200).json(AVATAR_STYLES);
}
