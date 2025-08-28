import { Request, Response } from "express";
import { db } from "../lib/prisma";

// GET /matches - Get all matches
export const getMatches = async (req: Request, res: Response) => {
  try {
    const matches = await db.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        homeTeamGoals: {
          include: {
            player: true,
          },
        },
        awayTeamGoals: {
          include: {
            player: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches" });
  }
};

// GET /matches/:id - Get a specific match
export const getMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await db.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        homeTeamGoals: {
          include: {
            player: true,
          },
        },
        awayTeamGoals: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch match" });
  }
};

// POST /matches - Create a new match
export const createMatch = async (req: Request, res: Response) => {
  try {
    const { homeTeamId, awayTeamId, scheduledAt } = req.body;

    console.log(req.body);

    if (!homeTeamId || !awayTeamId || !scheduledAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const match = await db.match.create({
      data: {
        homeTeamId,
        awayTeamId,
        scheduledAt: new Date(scheduledAt),
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: "Failed to create match" });
  }
};

// PUT /matches/:id - Update a match
export const updateMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { homeTeamId, awayTeamId, scheduledAt } = req.body;

    const match = await db.match.update({
      where: { id },
      data: {
        ...(homeTeamId && { homeTeamId }),
        ...(awayTeamId && { awayTeamId }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        homeTeamGoals: {
          include: {
            player: true,
          },
        },
        awayTeamGoals: {
          include: {
            player: true,
          },
        },
      },
    });

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: "Failed to update match" });
  }
};

// DELETE /matches/:id - Delete a match
export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.match.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete match" });
  }
};
