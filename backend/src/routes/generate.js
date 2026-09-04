import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { nanoid } from "nanoid";
import { generateAvatar } from "../services/aiService.js";
import { listStyles, getStyleById } from "../services/stylesStore.js";
import { associarAvatarAoVisitante } from "../services/credenciamentoService.js";
import { logSession } from "../db.js";

export const generateRouter = Router();

// GET /api/generate/styles — lista os estilos disponíveis (id + label
// apenas — o prompt fica só no backend) para o frontend montar as opções
// na tela de seleção. Editável em /admin.
generateRouter.get("/styles", (req, res) => {
  res.json(listStyles().map(({ id, label }) => ({ id, label })));
});

// POST /api/generate — recebe a foto em base64 (JSON) + styleId + dados
// do visitante, gera o avatar e grava a sessão.
generateRouter.post("/", async (req, res) => {
  const { imageBase64, styleId, visitanteId, nome } = req.body || {};
  const sessionId = nanoid(8);

  if (!imageBase64) {
    return res.status(400).json({ error: "imageBase64 é obrigatório" });
  }
  if (!styleId) {
    return res.status(400).json({ error: "styleId é obrigatório" });
  }

  const style = getStyleById(styleId);
  if (!style) {
    return res.status(400).json({ error: `Estilo desconhecido: ${styleId}` });
  }

  // Grava a foto recebida (data URL base64) num arquivo temporário, para
  // reaproveitar a mesma função de geração usada em qualquer contexto.
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const tempPhotoPath = path.join(os.tmpdir(), `upload_${sessionId}.jpg`);
  await fs.writeFile(tempPhotoPath, Buffer.from(base64Data, "base64"));

  try {
    const result = await generateAvatar({
      photoPath: tempPhotoPath,
      prompt: style.prompt,
    });

    const syncResult = await associarAvatarAoVisitante({
      visitanteId: visitanteId || null,
      avatarFilename: result.filename,
      estilo: style.label,
    });

    await logSession({
      sessionId,
      visitanteId: visitanteId || null,
      nome: nome || null,
      styleUsed: style.label,
      avatarFilename: result.filename,
      syncedToCredenciamento: syncResult.synced,
    });

    res.json({
      sessionId,
      filename: result.filename,
      styleUsed: style.label,
      imageUrl: `/avatars/${result.filename}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await fs.unlink(tempPhotoPath).catch(() => {});
  }
});
