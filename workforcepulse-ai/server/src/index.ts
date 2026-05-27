import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "WorkforcePulse AI API",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/analytics", analyticsRoutes);

app.use((_request, response) => {
  response.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`WorkforcePulse AI API running on http://localhost:${port}`);
});
