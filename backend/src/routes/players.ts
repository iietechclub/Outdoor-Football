import { Router } from "express";
import {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayersByTeam,
} from "../controllers/players";

const router = Router();

router.get("/", getAllPlayers);
router.get("/:id", getPlayerById);
router.post("/", createPlayer);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);
router.get("/team/:teamId", getPlayersByTeam);

export default router;
