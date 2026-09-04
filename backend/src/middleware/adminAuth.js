import { config } from "../config.js";

export function adminAuth(req, res, next) {
  if (!config.adminPassword) {
    res
      .status(500)
      .json({ error: "ADMIN_PASSWORD não configurado no servidor" });
    return;
  }

  const password = req.header("x-admin-password");
  if (password !== config.adminPassword) {
    res.status(401).json({ error: "Senha inválida" });
    return;
  }

  next();
}
