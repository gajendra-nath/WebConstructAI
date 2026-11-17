import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connectToDatabase } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import projectRouter from "./routes/projectRoutes.js";

const app = express();
await connectToDatabase();

app.use(express.json());
app.use(
  cors({
    origin: process.env.ORIGINS.split(","),
    credentials: true,
  })
);
app.use(cookieParser());

// ─── Rate Limiters ───────────────────────────────────────────────

// 1. Auth limiter — login/register pe max 10 req / 15 min / IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. API limiter — baaki project routes pe max 100 req / 15 min / IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────────────────────────────────

// Health check route
app.get("/", (_req, res) => {
  res.send("Server is live");
});

// API Routes
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/projects", apiLimiter, projectRouter);

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});