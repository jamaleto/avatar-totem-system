import { exec } from "node:child_process";
import { promisify } from "node:util";
import { getPrinterSettings } from "./settingsStore.js";

const execAsync = promisify(exec);

/**
 * Envia o arquivo para impressão. A configuração (modo/nome da
 * impressora) agora vem do settingsStore, editável em tempo real pelo
 * painel administrativo (/admin), sem precisar redeployar o backend.
 *
 * modo "cups": usa o comando `lp` (padrão em Linux e macOS) para mandar o
 * arquivo para a impressora configurada no sistema operacional.
 *
 * modo "none": não imprime, só confirma que o arquivo existe — útil
 * para testar o fluxo sem ter a impressora fisicamente conectada, ou
 * quando rodando na nuvem (onde não existe impressora nenhuma).
 */
export async function printAvatar(filePath) {
  const { printMode, printerName } = getPrinterSettings();

  if (printMode === "none") {
    return { printed: false, message: "PRINT_MODE=none — impressão simulada" };
  }

  if (printMode === "cups") {
    const printerFlag = printerName ? `-d "${printerName}"` : "";
    const cmd = `lp ${printerFlag} "${filePath}"`;
    try {
      const { stdout } = await execAsync(cmd);
      return { printed: true, message: stdout.trim() };
    } catch (err) {
      throw new Error(`Falha ao imprimir via CUPS: ${err.message}`);
    }
  }

  throw new Error(`PRINT_MODE desconhecido: ${printMode}`);
}
