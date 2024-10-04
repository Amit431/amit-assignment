import { Request, Response, Router } from "express";
import {
    handleUpdateStats,
    fetchScoreBoard,
    EditStats,
    ToggleStrike,
    ResetScoreBoard,
    changeBowler
} from "../controllers/updateStats.controller";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.json({ message: "ok" });
});

// POST
router.post("/match/edit/:matchId/:ballId", EditStats);

// PUT
router.put("/match/toggle/strike", ToggleStrike);

// POST /api/match/:matchId/update-stats
router.post("/match/:matchId/update-stats", handleUpdateStats);

// GET /api/match/:matchId/soreboard
router.get("/match/:matchId/scoreboard", fetchScoreBoard);

router.delete("/match/:matchId/reset", ResetScoreBoard);

router.get("/match/select/:matchId/:bowlerId", changeBowler);

export default router;
