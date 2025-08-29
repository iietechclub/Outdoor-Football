import { Router } from "express";
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  leaderBoardTeams,
} from "../controllers/teams";

const router = Router();

// Get all teams
router.get("/", getAllTeams);

// Get all leaderboard teams
router.get("/leaderboard", leaderBoardTeams);

// Get a single team by ID
router.get("/:id", getTeamById);

// Create a new team
router.post("/", createTeam);

// Update a team by ID
router.put("/:id", updateTeam);

// Delete a team by ID
router.delete("/:id", deleteTeam);

export default router;
