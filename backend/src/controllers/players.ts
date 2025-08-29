import { Request, Response } from "express";
import { db } from "../lib/prisma";

export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await db.player.findMany({
      include: {
        team: true,
        goals: true,
      },
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch players" });
  }
};

export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const player = await db.player.findUnique({
      where: { id },
      include: {
        team: true,
        goals: true,
      },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch player" });
  }
};

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const { name, teamId } = req.body;

    const player = await db.player.create({
      data: {
        name,
        teamId,
      },
      include: {
        team: true,
      },
    });

    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({ error: "Failed to create player" });
  }
};

export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, teamId } = req.body;

    const player = await db.player.update({
      where: { id },
      data: {
        name,
        teamId,
      },
      include: {
        team: true,
      },
    });

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: "Failed to update player" });
  }
};

export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.goal.deleteMany({
      where: { playerId: id },
    });
    await db.player.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete player" });
  }
};

export const getPlayersByTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const players = await db.player.findMany({
      where: { teamId },
      include: {
        team: true,
        goals: true,
      },
    });

    res.json(players);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch players by team" });
  }
};
