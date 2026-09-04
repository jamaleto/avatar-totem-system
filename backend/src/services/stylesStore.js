import { JSONFilePreset } from "lowdb/node";
import path from "node:path";
import { config } from "../config.js";

const dbFile = path.join(config.outputDir, "..", "styles.json");

const defaultData = {
  styles: [
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
  ],
};

const db = await JSONFilePreset(dbFile, defaultData);

export function listStyles() {
  return db.data.styles;
}

export function getStyleById(id) {
  return db.data.styles.find((s) => s.id === id);
}

export async function addStyle({ id, label, prompt }) {
  if (db.data.styles.some((s) => s.id === id)) {
    throw new Error(`Já existe um estilo com o id "${id}"`);
  }
  db.data.styles.push({ id, label, prompt });
  await db.write();
  return db.data.styles;
}

export async function updateStyle(id, { label, prompt }) {
  const style = db.data.styles.find((s) => s.id === id);
  if (!style) throw new Error(`Estilo "${id}" não encontrado`);
  if (label !== undefined) style.label = label;
  if (prompt !== undefined) style.prompt = prompt;
  await db.write();
  return style;
}

export async function deleteStyle(id) {
  const before = db.data.styles.length;
  db.data.styles = db.data.styles.filter((s) => s.id !== id);
  if (db.data.styles.length === before) {
    throw new Error(`Estilo "${id}" não encontrado`);
  }
  await db.write();
}
