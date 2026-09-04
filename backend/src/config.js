import "dotenv/config";
import path from "node:path";

export const config = {
  port: process.env.PORT || 3001,

  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN || "",
  },

  print: {
    mode: process.env.PRINT_MODE || "none", // "cups" | "none"
    printerName: process.env.PRINTER_NAME || "",
  },

  credenciamento: {
    baseUrl: process.env.CREDENCIAMENTO_API_URL || "",
    apiKey: process.env.CREDENCIAMENTO_API_KEY || "",
  },

  adminPassword: process.env.ADMIN_PASSWORD || "",

  outputDir: path.resolve(process.env.OUTPUT_DIR || "./data/avatars"),
};

export function checkConfig() {
  const warnings = [];
  if (!config.replicate.apiToken) {
    warnings.push(
      "REPLICATE_API_TOKEN não configurado — a geração de avatar vai falhar até você preencher o .env"
    );
  }
  if (!config.credenciamento.baseUrl) {
    warnings.push(
      "CREDENCIAMENTO_API_URL não configurada — o totem vai rodar em modo standalone, sem puxar/gravar dados do seu sistema de credenciamento"
    );
  }
  if (!config.adminPassword) {
    warnings.push(
      "ADMIN_PASSWORD não configurada — o painel administrativo (/admin) vai ficar inacessível até você definir uma senha"
    );
  }
  return warnings;
}
