import "dotenv/config";
import path from "node:path";

export const config = {
  port: process.env.PORT || 3001,

  fal: {
    apiKey: process.env.FAL_API_KEY || "",
    modelEndpoint:
      process.env.FAL_MODEL_ENDPOINT || "https://fal.run/fal-ai/instant-id",
  },

  print: {
    mode: process.env.PRINT_MODE || "none", // "cups" | "none"
    printerName: process.env.PRINTER_NAME || "",
  },

  credenciamento: {
    baseUrl: process.env.CREDENCIAMENTO_API_URL || "",
    apiKey: process.env.CREDENCIAMENTO_API_KEY || "",
  },

  outputDir: path.resolve(process.env.OUTPUT_DIR || "./data/avatars"),
};

export function checkConfig() {
  const warnings = [];
  if (!config.fal.apiKey) {
    warnings.push(
      "FAL_API_KEY não configurada — a geração de avatar vai falhar até você preencher o .env"
    );
  }
  if (!config.credenciamento.baseUrl) {
    warnings.push(
      "CREDENCIAMENTO_API_URL não configurada — o totem vai rodar em modo standalone, sem puxar/gravar dados do seu sistema de credenciamento"
    );
  }
  return warnings;
}
