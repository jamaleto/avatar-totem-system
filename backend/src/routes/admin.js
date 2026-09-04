import { Router } from "express";
import path from "node:path";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  listStyles,
  addStyle,
  updateStyle,
  deleteStyle,
} from "../services/stylesStore.js";
import {
  getPrinterSettings,
  setPrinterSettings,
} from "../services/settingsStore.js";
import { printAvatar } from "../services/printerService.js";
import { listSessions } from "../db.js";
import { config } from "../config.js";

export const adminRouter = Router();

// POST /api/admin/login — o frontend chama isso uma vez pra validar a
// senha antes de guardar ela localmente (sessionStorage) e usá-la nas
// próximas chamadas.
adminRouter.post("/login", adminAuth, (req, res) => {
  res.json({ ok: true });
});

// A partir daqui, toda rota exige a senha no header x-admin-password.
adminRouter.use(adminAuth);

// ── Estilos ──────────────────────────────────────────────
adminRouter.get("/styles", (req, res) => {
  res.json(listStyles());
});

adminRouter.post("/styles", async (req, res) => {
  const { id, label, prompt } = req.body || {};
  if (!id || !label || !prompt) {
    res.status(400).json({ error: "id, label e prompt são obrigatórios" });
    return;
  }
  try {
    const styles = await addStyle({ id, label, prompt });
    res.json(styles);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.put("/styles/:id", async (req, res) => {
  try {
    const style = await updateStyle(req.params.id, req.body || {});
    res.json(style);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

adminRouter.delete("/styles/:id", async (req, res) => {
  try {
    await deleteStyle(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// ── Galeria ──────────────────────────────────────────────
adminRouter.get("/gallery", (req, res) => {
  const sessions = listSessions().slice().reverse();
  res.json(sessions);
});

// ── Impressora ───────────────────────────────────────────
adminRouter.get("/printer", (req, res) => {
  res.json(getPrinterSettings());
});

adminRouter.post("/printer", async (req, res) => {
  const settings = await setPrinterSettings(req.body || {});
  res.json(settings);
});

// Imprime uma foto já existente na galeria, pra testar a configuração.
adminRouter.post("/printer/test", async (req, res) => {
  const { filename } = req.body || {};
  if (!filename) {
    res
      .status(400)
      .json({ error: "filename é obrigatório (escolha uma foto da galeria)" });
    return;
  }
  try {
    const result = await printAvatar(path.join(config.outputDir, filename));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
