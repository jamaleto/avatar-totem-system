import express from "express";
import cors from "cors";
import { config, checkConfig } from "./config.js";
import { checkinRouter } from "./routes/checkin.js";
import { generateRouter } from "./routes/generate.js";
import { printRouter } from "./routes/print.js";

const app = express();

app.use(cors());
app.use(express.json());

// Serve as imagens geradas para o frontend exibir/imprimir
app.use("/avatars", express.static(config.outputDir));

app.use("/api/checkin", checkinRouter);
app.use("/api/generate", generateRouter);
app.use("/api/print", printRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", warnings: checkConfig() });
});

app.listen(config.port, () => {
  console.log(`\n🎭 Avatar Totem backend rodando em http://localhost:${config.port}`);
  const warnings = checkConfig();
  if (warnings.length) {
    console.log("\n⚠️  Avisos de configuração:");
    warnings.forEach((w) => console.log(`   - ${w}`));
    console.log("");
  }
});
