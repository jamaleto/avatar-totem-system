import fetch from "node-fetch";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

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
 * Gera o avatar chamando o endpoint da fal.ai.
 * Recebe o caminho local da foto capturada e o id do estilo escolhido.
 * Retorna o caminho local do arquivo gerado.
 *
 * IMPORTANTE: o slug do modelo (`config.fal.modelEndpoint`) e o formato
 * exato do payload podem mudar — confira sempre a doc atual do modelo
 * escolhido em https://fal.ai/models antes de ir para produção.
 */
export async function generateAvatar({ photoPath, styleId }) {
  const style = AVATAR_STYLES.find((s) => s.id === styleId);
  if (!style) {
    throw new Error(`Estilo de avatar desconhecido: ${styleId}`);
  }
  if (!config.fal.apiKey) {
    throw new Error(
      "FAL_API_KEY não configurada no .env — veja .env.example"
    );
  }

  const imageBuffer = await fs.readFile(photoPath);
  const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString(
    "base64"
  )}`;

  const response = await fetch(config.fal.modelEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${config.fal.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageBase64,
      prompt: style.prompt,
      // Parâmetros comuns em modelos de identidade preservada (InstantID/PhotoMaker).
      // Nomes de campo variam por modelo — ajuste conforme a doc do modelo escolhido.
      identity_strength: 0.8,
      num_inference_steps: 25,
      guidance_scale: 5,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Falha na geração de avatar (${response.status}): ${errText}`
    );
  }

  const result = await response.json();

  // A maioria dos modelos fal.ai retorna { images: [{ url: "..." }] }
  const generatedUrl = result?.images?.[0]?.url;
  if (!generatedUrl) {
    throw new Error(
      "Resposta da IA não trouxe uma imagem gerada — verifique o formato de retorno do modelo escolhido"
    );
  }

  const imgResponse = await fetch(generatedUrl);
  const imgArrayBuffer = await imgResponse.arrayBuffer();

  await fs.mkdir(config.outputDir, { recursive: true });
  const filename = `avatar_${Date.now()}.jpg`;
  const outputPath = path.join(config.outputDir, filename);
  await fs.writeFile(outputPath, Buffer.from(imgArrayBuffer));

  return { outputPath, filename, styleUsed: style.label };
}
