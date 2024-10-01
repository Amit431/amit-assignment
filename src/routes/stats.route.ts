import { Router } from "express";
import { handleUpdateStats, fetchScoreBoard, EditStats } from "../controllers/updateStats.controller";

const router = Router();

// POST
router.post("/match/edit/:matchId/:ballId", EditStats);

// POST /api/match/:matchId/update-stats
router.post("/match/:matchId/update-stats", handleUpdateStats);

// GET /api/match/:matchId/soreboard
router.get("/match/:matchId/scoreboard", fetchScoreBoard);


export default router;
