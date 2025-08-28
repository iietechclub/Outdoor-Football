import { Router } from "express";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
} from "../controllers/matches";

const router = Router();

// GET /matches - Get all matches
router.get("/", getMatches);

// GET /matches/:id - Get a specific match
router.get("/:id", getMatch);

// POST /matches - Create a new match
router.post("/", createMatch);

// PUT /matches/:id - Update a match
router.put("/:id", updateMatch);

// DELETE /matches/:id - Delete a match
router.delete("/:id", deleteMatch);

export default router;
