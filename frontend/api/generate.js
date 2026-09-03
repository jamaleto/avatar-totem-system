// Versão serverless (Vercel) da geração de avatar — usada só para testes
// online. A versão "de verdade" para o dia do evento é
// backend/src/services/aiService.js, que roda no computador local do totem
// (sem limite de tempo de execução, diferente de uma função serverless).

const STYLE_PROMPTS = {
  cyberpunk:
    "cyberpunk portrait, neon lights, futuristic city background, digital art, high detail, cinematic lighting",
  classico:
    "professional studio portrait, soft lighting, elegant background, high detail, photorealistic",
  aquarela:
    "watercolor painting portrait, soft brush strokes, pastel colors, artistic, delicate",
  heroi:
    "comic book superhero style portrait, bold colors, dynamic pose, dramatic lighting",
};

// Modelo InstantID no Replicate — mantenha sincronizado com
// backend/src/services/aiService.js
const REPLICATE_MODEL_VERSION =
  "11219f80ba03ca1ce78194191ffa4fc74f7c1afeef50df95f477aa66f2f65bc5";

async function runReplicate({ apiToken, imageBase64, prompt }) {
  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiToken}`,
      "Content-Type": "application/json",
      Prefer: "wait=20",
    },
    body: JSON.stringify({
      version: REPLICATE_MODEL_VERSION,
      input: {
        image: imageBase64,
        prompt,
        negative_prompt: "",
        num_inference_steps: 30,
        guidance_scale: 5,
        ip_adapter_scale: 0.8,
        controlnet_conditioning_scale: 0.8,
      },
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Falha ao criar predição (${createRes.status}): ${errText}`);
  }

  let prediction = await createRes.json();

  // Orçamento total de ~30s de polling (além do wait=20 acima), somando
  // ~50s, com folga segura abaixo do limite de 60s da função no Vercel.
  const deadline = Date.now() + 30000;
  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled" &&
    Date.now() < deadline
  ) {
    await new Promise((r) => setTimeout(r, 1500));
    const pollRes = await fetch(prediction.urls.get, {
      headers: { Authorization: `Token ${apiToken}` },
    });
    prediction = await pollRes.json();
  }

  if (prediction.status !== "succeeded") {
    // Cancela a predição no Replicate se ainda estiver rodando, para não
    // deixar cobrando/rodando à toa depois que desistimos de esperar.
    if (prediction.urls?.cancel) {
      fetch(prediction.urls.cancel, {
        method: "POST",
        headers: { Authorization: `Token ${apiToken}` },
      }).catch(() => {});
    }
    throw new Error(
      prediction.status === "starting" || prediction.status === "processing"
        ? "A geração está demorando mais que o normal (provavelmente o modelo estava 'frio' no servidor). Tente novamente — a segunda tentativa costuma ser bem mais rápida."
        : `Geração falhou (status: ${prediction.status}): ${prediction.error || "sem detalhes"}`
    );
  }

  const generatedUrl = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output;

  if (!generatedUrl) {
    throw new Error("O Replicate não retornou uma imagem gerada");
  }

  return generatedUrl;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  if (!REPLICATE_API_TOKEN) {
    res.status(500).json({
      error:
        "REPLICATE_API_TOKEN não configurado nas variáveis de ambiente do projeto no Vercel (Settings → Environment Variables).",
    });
    return;
  }

  const { imageBase64, styleId } = req.body || {};

  if (!imageBase64 || !styleId) {
    res.status(400).json({ error: "imageBase64 e styleId são obrigatórios" });
    return;
  }

  const prompt = STYLE_PROMPTS[styleId];
  if (!prompt) {
    res.status(400).json({ error: `Estilo desconhecido: ${styleId}` });
    return;
  }

  try {
    // Corrida contra um timeout de segurança: garante que SEMPRE
    // respondemos JSON válido antes do Vercel encerrar a função à força
    // (o que geraria uma página HTML de erro, quebrando o frontend).
    const result = await Promise.race([
      (async () => {
        const generatedUrl = await runReplicate({
          apiToken: REPLICATE_API_TOKEN,
          imageBase64,
          prompt,
        });
        const imgResponse = await fetch(generatedUrl);
        const arrayBuffer = await imgResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        return {
          imageBase64: `data:image/jpeg;base64,${base64}`,
          styleUsed: styleId,
          filename: `avatar_${Date.now()}.jpg`,
        };
      })(),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Tempo esgotado esperando a IA gerar a imagem. Tente novamente — costuma ficar mais rápido na segunda tentativa."
              )
            ),
          55000
        )
      ),
    ]);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
