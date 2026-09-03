import fetch from "node-fetch";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

// Modelo InstantID no Replicate — preserva o rosto da foto original.
// Se quiser trocar de versão, veja replicate.com/zsxkib/instant-id
const REPLICATE_MODEL_VERSION =
  "11219f80ba03ca1ce78194191ffa4fc74f7c1afeef50df95f477aa66f2f65bc5";

// Mesma proporção de impressão usada na captura da foto (retrato).
// Resolução mais moderada = geração mais rápida (o modelo já faz upscale
// razoável na impressão; não precisa gerar em altíssima resolução).
const OUTPUT_WIDTH = 768;
const OUTPUT_HEIGHT = 1152;

async function runReplicate({ apiToken, imageBase64, prompt }) {
  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiToken}`,
      "Content-Type": "application/json",
      Prefer: "wait=55",
    },
    body: JSON.stringify({
      version: REPLICATE_MODEL_VERSION,
      input: {
        image: imageBase64,
        prompt,
        negative_prompt: "",
        width: OUTPUT_WIDTH,
        height: OUTPUT_HEIGHT,
        num_inference_steps: 20,
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

  // O backend roda no Railway (servidor normal, sem limite de tempo por
  // requisição), então podemos esperar bem mais que numa função serverless.
  let attempts = 0;
  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled" &&
    attempts < 90
  ) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(prediction.urls.get, {
      headers: { Authorization: `Token ${apiToken}` },
    });
    prediction = await pollRes.json();
    attempts += 1;
  }

  if (prediction.status !== "succeeded") {
    throw new Error(
      `Geração falhou (status: ${prediction.status}): ${prediction.error || "sem detalhes"}`
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

/**
 * Estilos de avatar disponíveis no totem.
 * Cada estilo é um prompt fixo — isso mantém a geração consistente
 * e evita que o visitante precise digitar qualquer coisa.
 * Ajuste/expanda livremente para os estilos do seu evento.
 */
export const AVATAR_STYLES = [
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    prompt:
      "cyberpunk portrait, neon lights, futuristic city background, digital art, high detail, cinematic lighting",
  },
  {
    id: "classico",
    label: "Retrato Clássico",
    prompt:
      "professional studio portrait, soft lighting, elegant background, high detail, photorealistic",
  },
  {
    id: "aquarela",
    label: "Aquarela",
    prompt:
      "watercolor painting portrait, soft brush strokes, pastel colors, artistic, delicate",
  },
  {
    id: "heroi",
    label: "Herói",
    prompt:
      "comic book superhero style portrait, bold colors, dynamic pose, dramatic lighting",
  },
];

/**
 * Gera o avatar chamando o modelo InstantID no Replicate.
 * Recebe o caminho local da foto capturada e o id do estilo escolhido.
 * Retorna o caminho local do arquivo gerado.
 */
export async function generateAvatar({ photoPath, styleId }) {
  const style = AVATAR_STYLES.find((s) => s.id === styleId);
  if (!style) {
    throw new Error(`Estilo de avatar desconhecido: ${styleId}`);
  }
  if (!config.replicate.apiToken) {
    throw new Error(
      "REPLICATE_API_TOKEN não configurado no .env — veja .env.example"
    );
  }

  const imageBuffer = await fs.readFile(photoPath);
  const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString(
    "base64"
  )}`;

  const generatedUrl = await runReplicate({
    apiToken: config.replicate.apiToken,
    imageBase64,
    prompt: style.prompt,
  });

  const imgResponse = await fetch(generatedUrl);
  const imgArrayBuffer = await imgResponse.arrayBuffer();

  await fs.mkdir(config.outputDir, { recursive: true });
  const filename = `avatar_${Date.now()}.jpg`;
  const outputPath = path.join(config.outputDir, filename);
  await fs.writeFile(outputPath, Buffer.from(imgArrayBuffer));

  return { outputPath, filename, styleUsed: style.label };
}
