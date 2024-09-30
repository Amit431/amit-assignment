import { Router } from "express";
import { handleUpdateStats, fetchScoreBoard } from "../controllers/updateStats.controller";

const router = Router();

// POST /api/match/:matchId/update-stats
router.post("/match/:matchId/update-stats", handleUpdateStats);

// GET /api/match/:matchId/soreboard
router.get("/match/:matchId/scoreboard", fetchScoreBoard);

export default router;
