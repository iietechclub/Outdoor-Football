import { Router } from "express";
import { setMatchLive, getCurrentLiveMatch } from "../controllers/live";

const router = Router();

// GET /matches - Get all matches
router.get("/", getCurrentLiveMatch);

// GET /matches/:id - Get a specific match
router.post("/:matchId", setMatchLive);

export default router;
