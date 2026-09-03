import { Router } from "express";
import multer from "multer";
import fs from "node:fs/promises";
import { nanoid } from "nanoid";
import { generateAvatar, AVATAR_STYLES } from "../services/aiService.js";
import { associarAvatarAoVisitante } from "../services/credenciamentoService.js";
import { logSession } from "../db.js";

export const generateRouter = Router();

const upload = multer({ dest: "/tmp/avatar-totem-uploads" });

// GET /api/generate/styles — lista os estilos disponíveis para o
// frontend montar as opções na tela de seleção.
generateRouter.get("/styles", (req, res) => {
  res.json(AVATAR_STYLES.map(({ id, label }) => ({ id, label })));
});

// POST /api/generate — recebe a foto (multipart/form-data, campo "photo")
// + styleId + dados do visitante, gera o avatar e grava a sessão.
generateRouter.post("/", upload.single("photo"), async (req, res) => {
  const { styleId, visitanteId, nome } = req.body;
  const sessionId = nanoid(8);

  if (!req.file) {
    return res.status(400).json({ error: "Nenhuma foto enviada" });
  }
  if (!styleId) {
    return res.status(400).json({ error: "styleId é obrigatório" });
  }

  try {
    const result = await generateAvatar({
      photoPath: req.file.path,
      styleId,
    });

    const syncResult = await associarAvatarAoVisitante({
      visitanteId: visitanteId || null,
      avatarFilename: result.filename,
      estilo: result.styleUsed,
    });

    await logSession({
      sessionId,
      visitanteId: visitanteId || null,
      nome: nome || null,
      styleUsed: result.styleUsed,
      avatarFilename: result.filename,
      syncedToCredenciamento: syncResult.synced,
    });

    res.json({
      sessionId,
      filename: result.filename,
      styleUsed: result.styleUsed,
      imageUrl: `/avatars/${result.filename}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // limpa o arquivo temporário da foto original
    await fs.unlink(req.file.path).catch(() => {});
  }
});
