import { Router } from "express";
import { handleUpdateStats } from "../controllers/updateStats.controller";

const router = Router();

// POST /api/match/:matchId/update-stats
router.post("/match/:matchId/update-stats", handleUpdateStats);

export default router;
