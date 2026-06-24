// Entry point — Express app (full implementation in Step 6)
import express, { Application } from "express";
import "dotenv/config";
import { config } from "./config";

const app: Application = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`API server running on http://localhost:${config.port} (${config.nodeEnv})`);
});

export default app;
