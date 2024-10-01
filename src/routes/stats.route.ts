import { Router } from "express";
import { handleUpdateStats, fetchScoreBoard, EditStats, ToggleStrike, ResetScoreBoard } from "../controllers/updateStats.controller";

const router = Router();

// POST
router.post("/match/edit/:matchId/:ballId", EditStats);

// PUT
router.put("/match/toggle/strike", ToggleStrike);

// POST /api/match/:matchId/update-stats
router.post("/match/:matchId/update-stats", handleUpdateStats);

// GET /api/match/:matchId/soreboard
router.get("/match/:matchId/scoreboard", fetchScoreBoard);

router.delete("/match/:matchId/reset", ResetScoreBoard);

export default router;
