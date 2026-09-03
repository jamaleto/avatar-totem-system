import { Router } from "express";
import path from "node:path";
import { printAvatar } from "../services/printerService.js";
import { config } from "../config.js";

export const printRouter = Router();

// POST /api/print  { filename: "avatar_123.jpg" }
printRouter.post("/", async (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: "filename é obrigatório" });
  }

  const filePath = path.join(config.outputDir, filename);

  try {
    const result = await printAvatar(filePath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
