import { exec } from "node:child_process";
import { promisify } from "node:util";
import { config } from "../config.js";

const execAsync = promisify(exec);

/**
 * Envia o arquivo para impressão.
 *
 * modo "cups": usa o comando `lp` (padrão em Linux e macOS) para mandar o
 * arquivo para a impressora configurada no sistema operacional. Isso
 * funciona bem com a maioria das impressoras fotográficas dye-sub
 * (DNP, Mitsubishi) desde que o driver do fabricante já esteja instalado
 * e a impressora configurada como impressora do sistema.
 *
 * modo "none": não imprime, só confirma que o arquivo existe — útil
 * para testar o fluxo sem ter a impressora fisicamente conectada.
 *
 * Se sua impressora tiver um SDK próprio (comum em modelos DNP/Mitsubishi
 * de alto volume), troque esta função pela chamada ao SDK do fabricante.
 */
export async function printAvatar(filePath) {
  if (config.print.mode === "none") {
    return { printed: false, message: "PRINT_MODE=none — impressão simulada" };
  }

  if (config.print.mode === "cups") {
    const printerFlag = config.print.printerName
      ? `-d "${config.print.printerName}"`
      : "";
    const cmd = `lp ${printerFlag} "${filePath}"`;
    try {
      const { stdout } = await execAsync(cmd);
      return { printed: true, message: stdout.trim() };
    } catch (err) {
      throw new Error(`Falha ao imprimir via CUPS: ${err.message}`);
    }
  }

  throw new Error(`PRINT_MODE desconhecido: ${config.print.mode}`);
}
