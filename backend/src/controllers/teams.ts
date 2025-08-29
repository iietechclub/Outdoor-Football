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
    const team = await db.team.findUnique({
      where: { id },
      select: {
        _count: {
          select: { players: true, awayMatches: true, homeMatches: true },
        },
      },
    });

    if (!team) return res.status(404).send();

    const { players, homeMatches, awayMatches } = team._count;

    if (players) {
      return res
        .status(400)
        .json({ message: "This team has players, delete them first." });
    }

    if (awayMatches || homeMatches) {
      return res.status(400).json({
        message: "This team is included in a match, delete that match first.",
      });
    }

    await db.team.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete team" });
  }
};

export const leaderBoardTeams = async (_req: Request, res: Response) => {
  try {
    const teams = await db.team.findMany({
      include: {
        homeMatches: {
          include: {
            homeTeamGoals: true,
            awayTeamGoals: true,
          },
        },
        awayMatches: {
          include: {
            homeTeamGoals: true,
            awayTeamGoals: true,
          },
        },
        goals: true,
      },
    });

    const leaderboard = teams
      .map((team) => {
        let points = 0;
        let goalsFor = team.goals.length;
        let goalsAgainst = 0;

        // Calculate points from home matches
        team.homeMatches.forEach((match) => {
          const homeGoals = match.homeTeamGoals.length;
          const awayGoals = match.awayTeamGoals.length;

          if (homeGoals > awayGoals) {
            points += 3; // Win
          } else if (homeGoals === awayGoals) {
            points += 1; // Draw
          }

          goalsAgainst += awayGoals;
        });

        // Calculate points from away matches
        team.awayMatches.forEach((match) => {
          const homeGoals = match.homeTeamGoals.length;
          const awayGoals = match.awayTeamGoals.length;

          if (awayGoals > homeGoals) {
            points += 3; // Win
          } else if (awayGoals === homeGoals) {
            points += 1; // Draw
          }

          goalsAgainst += homeGoals;
        });

        const goalDifference = goalsFor - goalsAgainst;

        return {
          id: team.id,
          name: team.name,
          points,
          goalDifference,
        };
      })
      .sort(
        (a, b) => b.points - a.points || b.goalDifference - a.goalDifference
      );

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
