import { Router } from "express";
import { buscarVisitantePorCodigo } from "../services/credenciamentoService.js";
import { listSessions } from "../db.js";

export const checkinRouter = Router();

// GET /api/checkin/:codigo — chamado quando o visitante escaneia o
// badge/QR code no totem, para puxar nome/email já cadastrados.
checkinRouter.get("/:codigo", async (req, res) => {
  try {
    const visitante = await buscarVisitantePorCodigo(req.params.codigo);
    res.json(visitante);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// GET /api/checkin/export/all — lista todas as sessões geradas no totem
// (útil para exportar ao final do evento, ou se a integração em tempo
// real com o credenciamento não estiver disponível no local).
checkinRouter.get("/export/all", (req, res) => {
  res.json(listSessions());
});
