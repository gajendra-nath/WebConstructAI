import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getPublicProject,
  listProjects,
  publishProject,
  updateProjectFiles,
} from "../controllers/projectController.js";
import { chat } from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";

// 3. AI limiter — project create aur chat pe max 20 req / 1 hour / IP
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "AI usage limit reached. Please try again after 1 hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

const projectRouter = Router();

// Public route (no auth required)
projectRouter.get("/public/:id", getPublicProject);

// Protect all following routes
projectRouter.use(authMiddleware);

projectRouter.post("/", aiLimiter, createProject);       // AI — limited
projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProject);
projectRouter.delete("/:id", deleteProject);
projectRouter.put("/:id/files", updateProjectFiles);
projectRouter.post("/:id/publish", publishProject);

// Chat revision route — AI, limited
projectRouter.post("/:id/chat", aiLimiter, chat);

export default projectRouter;