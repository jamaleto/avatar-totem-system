import { JSONFilePreset } from "lowdb/node";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";

const dbFile = path.join(config.outputDir, "..", "sessions.json");
await fs.mkdir(path.dirname(dbFile), { recursive: true });

const defaultData = { sessions: [] };

export const db = await JSONFilePreset(dbFile, defaultData);

/**
 * Registra uma sessão completa (foto -> avatar -> impressão) localmente.
 * Serve como log/auditoria e como base para exportar tudo pro seu
 * sistema de credenciamento depois, caso a integração em tempo real
 * não esteja disponível durante o evento (ex: internet instável).
 */
export async function logSession(entry) {
  db.data.sessions.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  await db.write();
}

export function listSessions() {
  return db.data.sessions;
}
