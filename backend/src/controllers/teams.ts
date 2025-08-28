import { Request, Response } from "express";
import { db } from "../lib/prisma";

// Create a new team
export const createTeam = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Team name is required" });
  }
  try {
    const team = await db.team.create({ data: { name } });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: "Failed to create team" });
  }
};

// Get all teams
export const getAllTeams = async (_req: Request, res: Response) => {
  try {
    const teams = await db.team.findMany();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

// Get a single team by ID
export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const team = await db.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team" });
  }
};

// Update a team
export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Team name is required" });
  }
  try {
    const team = await db.team.update({
      where: { id },
      data: { name },
    });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: "Failed to update team" });
  }
};

// Delete a team
export const deleteTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.team.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete team" });
  }
};
