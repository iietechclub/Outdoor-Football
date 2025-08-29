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
          where: { status: "Finished" },
          include: {
            homeTeamGoals: true,
            awayTeamGoals: true,
          },
        },
        awayMatches: {
          where: { status: "Finished" },
          include: {
            homeTeamGoals: true,
            awayTeamGoals: true,
          },
        },
      },
    });

    const leaderboard = teams
      .map((team) => {
        let points = 0;
        let goalsFor = 0;
        let goalsAgainst = 0;

        // Calculate points from home matches
        team.homeMatches.forEach((match) => {
          const homeGoalsRegular = match.homeTeamGoals.filter(
            (goal) => !goal.isPenalty
          ).length;
          const awayGoalsRegular = match.awayTeamGoals.filter(
            (goal) => !goal.isPenalty
          ).length;
          const homeGoalsPenalty = match.homeTeamGoals.filter(
            (goal) => goal.isPenalty
          ).length;
          const awayGoalsPenalty = match.awayTeamGoals.filter(
            (goal) => goal.isPenalty
          ).length;

          // Add goals for/against (only regular time + extra time goals, not penalty shootout)
          goalsFor += homeGoalsRegular;
          goalsAgainst += awayGoalsRegular;

          // Determine winner: first check regular goals, then penalty shootout if tied
          if (homeGoalsRegular > awayGoalsRegular) {
            points += 3; // Win in regular/extra time
          } else if (homeGoalsRegular < awayGoalsRegular) {
            // Loss in regular/extra time
          } else {
            // Tied in regular/extra time, check penalty shootout
            if (homeGoalsPenalty > awayGoalsPenalty) {
              points += 3; // Win on penalties
            } else if (homeGoalsPenalty < awayGoalsPenalty) {
              // Loss on penalties
            } else {
              points += 1; // Draw (no penalty shootout or tied penalties)
            }
          }
        });

        // Calculate points from away matches
        team.awayMatches.forEach((match) => {
          const homeGoalsRegular = match.homeTeamGoals.filter(
            (goal) => !goal.isPenalty
          ).length;
          const awayGoalsRegular = match.awayTeamGoals.filter(
            (goal) => !goal.isPenalty
          ).length;
          const homeGoalsPenalty = match.homeTeamGoals.filter(
            (goal) => goal.isPenalty
          ).length;
          const awayGoalsPenalty = match.awayTeamGoals.filter(
            (goal) => goal.isPenalty
          ).length;

          // Add goals for/against (only regular time + extra time goals, not penalty shootout)
          goalsFor += awayGoalsRegular;
          goalsAgainst += homeGoalsRegular;

          // Determine winner: first check regular goals, then penalty shootout if tied
          if (awayGoalsRegular > homeGoalsRegular) {
            points += 3; // Win in regular/extra time
          } else if (awayGoalsRegular < homeGoalsRegular) {
            // Loss in regular/extra time
          } else {
            // Tied in regular/extra time, check penalty shootout
            if (awayGoalsPenalty > homeGoalsPenalty) {
              points += 3; // Win on penalties
            } else if (awayGoalsPenalty < homeGoalsPenalty) {
              // Loss on penalties
            } else {
              points += 1; // Draw (no penalty shootout or tied penalties)
            }
          }
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
