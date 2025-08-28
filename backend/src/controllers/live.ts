import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setMatchLive = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    // First, set all matches to not live (assuming isLive field exists or will be added)
    await prisma.match.updateMany({ data: { isLive: false } });

    // Then set the specified match to live
    await prisma.match.update({
      where: { id: matchId },
      data: { isLive: true },
    });

    res.status(200).json({
      message: "Match set to live successfully",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Match not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentLiveMatch = async (req: Request, res: Response) => {
  try {
    const liveMatch = await prisma.match.findFirst({
      where: { isLive: true },
      include: {
        homeTeam: true,
        awayTeam: true,
        homeTeamGoals: {
          include: {
            player: true,
            team: true,
          },
        },
        awayTeamGoals: {
          include: {
            player: true,
            team: true,
          },
        },
      },
    });

    if (!liveMatch) {
      return res.status(404).json({ message: "No live match found" });
    }

    res.status(200).json({ match: liveMatch });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
