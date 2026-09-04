import { JSONFilePreset } from "lowdb/node";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

const dbFile = path.join(config.outputDir, "..", "settings.json");
await fs.mkdir(path.dirname(dbFile), { recursive: true });

const defaultData = {
  printMode: config.print.mode,
  printerName: config.print.printerName,
};

const db = await JSONFilePreset(dbFile, defaultData);

export function getPrinterSettings() {
  return {
    printMode: db.data.printMode,
    printerName: db.data.printerName,
  };
}

export async function setPrinterSettings({ printMode, printerName }) {
  if (printMode !== undefined) db.data.printMode = printMode;
  if (printerName !== undefined) db.data.printerName = printerName;
  await db.write();
  return getPrinterSettings();
}
