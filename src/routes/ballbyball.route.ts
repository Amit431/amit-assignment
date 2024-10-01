import { Router } from "express";
import { fetchBallbyBall } from "../controllers/ballbyball.controller";

const router = Router();

// POST /api/match/:matchId/update-stats
router.get("/ballbyball", fetchBallbyBall);

export default router;
