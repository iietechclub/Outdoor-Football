import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { db } from "./lib/prisma";
import teamsRouter from "./routes/teams";
import playersRouter from "./routes/players";
import matchesRouter from "./routes/matches";
import liveRouter from "./routes/live";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
  allowEIO3: true,
});

app.use(express.json());
app.use(cors({ origin: "*" }));

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static("../client/dist"));
  app.use("/admin", express.static("../client/dist"));
}

app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/live", liveRouter);

const config = {
  halfDuration: parseInt(process.env.HALF_DURATION || "15", 10) * 60,
  extraTimeDuration: parseInt(process.env.EXTRA_TIME_DURATION || "15", 10) * 60,
  penaltyShootoutDuration:
    parseInt(process.env.PENALTY_SHOOTOUT_DURATION || "15", 10) * 60,
};

io.on("connection", (socket) => {
  console.log("New Client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });

  socket.on("timer:request", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true },
    });

    if (!liveMatch) return socket.emit("timer:stop");

    if (liveMatch.status === "NotStarted") {
      socket.emit("timer:stop");
    } else if (liveMatch.status === "InProgress") {
      const elapsedTime = Math.floor(
        (Date.now() - liveMatch.startTime!.getTime()) / 1000
      );
      let remainingTime = 0;

      if (liveMatch.stage === "FirstHalf" || liveMatch.stage === "SecondHalf") {
        remainingTime = config.halfDuration - elapsedTime;
      } else if (liveMatch.stage === "ExtraTime") {
        remainingTime = config.extraTimeDuration - elapsedTime;
      }

      if (
        liveMatch.stage === "PenaltyShootout" ||
        liveMatch.stage === "Halftime"
      ) {
        socket.emit("timer:stop");
      } else socket.emit("timer:start", remainingTime);
    } else if (liveMatch.status === "Paused") {
      let remainingTime = 0;

      if (liveMatch.stage === "FirstHalf") {
        remainingTime = config.halfDuration - liveMatch.firstHalfElapsedTime;
      } else if (liveMatch.stage === "SecondHalf") {
        remainingTime = config.halfDuration - liveMatch.secondHalfElapsedTime;
      } else if (liveMatch.stage === "ExtraTime") {
        remainingTime =
          config.extraTimeDuration - liveMatch.extraTimeElapsedTime;
      }

      if (
        liveMatch.stage === "PenaltyShootout" ||
        liveMatch.stage === "Halftime"
      ) {
        socket.emit("timer:stop");
      } else socket.emit("timer:pause", remainingTime);
    } else {
      socket.emit("timer:stop");
    }
  });

  socket.on("match:request", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true },
      select: { id: true, stage: true, status: true },
    });

    const match = await db.match.findFirst({
      where: { isLive: true },
      select: {
        id: true,
        stage: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        homeTeamGoals: { select: { isPenalty: true } },
        awayTeamGoals: { select: { isPenalty: true } },
      },
    });

    socket.emit("match:info", match);
  });

  socket.on("match:pause", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true, status: "InProgress" },
    });

    if (!liveMatch) return;

    if (liveMatch.stage === "FirstHalf" || liveMatch.stage === "SecondHalf") {
      const elapsedTime = Math.floor(
        (Date.now() - liveMatch.startTime!.getTime()) / 1000
      );
      const remainingTime =
        liveMatch.stage === "FirstHalf"
          ? config.halfDuration - elapsedTime
          : config.halfDuration - elapsedTime;

      await db.match.update({
        where: { id: liveMatch.id },
        data: {
          status: "Paused",
          ...(liveMatch.stage === "FirstHalf"
            ? { firstHalfElapsedTime: elapsedTime }
            : { secondHalfElapsedTime: elapsedTime }),
        },
      });

      io.emit("timer:pause", remainingTime);
    } else if (liveMatch.stage === "ExtraTime") {
      const elapsedTime = Math.floor(
        (Date.now() - liveMatch.startTime!.getTime()) / 1000
      );
      const remainingTime = config.extraTimeDuration - elapsedTime;

      await db.match.update({
        where: { id: liveMatch.id },
        data: { status: "Paused", extraTimeElapsedTime: elapsedTime },
      });

      io.emit("timer:pause", remainingTime);
    } else {
      io.emit("timer:stop");
    }
  });

  socket.on("match:resume", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true, status: "Paused" },
    });

    if (!liveMatch) return;

    let elapsedTime = 0,
      remainingTime = 0;

    if (liveMatch.stage === "FirstHalf") {
      elapsedTime = liveMatch.firstHalfElapsedTime;
      remainingTime = config.halfDuration - elapsedTime;
    } else if (liveMatch.stage === "SecondHalf") {
      elapsedTime = liveMatch.secondHalfElapsedTime;
      remainingTime = config.halfDuration - elapsedTime;
    } else if (liveMatch.stage === "Halftime") {
      return socket.emit("timer:stop");
    } else if (liveMatch.stage === "ExtraTime") {
      elapsedTime = liveMatch.extraTimeElapsedTime;
      remainingTime = config.extraTimeDuration - elapsedTime;
    }

    const startTime = new Date(Date.now() - elapsedTime * 1000);
    await db.match.update({
      where: { id: liveMatch.id },
      data: { status: "InProgress", startTime },
    });

    io.emit("timer:resume", remainingTime);
  });

  socket.on("match:start-firstHalf", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true },
      select: { id: true },
    });

    if (!liveMatch) return;

    await db.match.update({
      where: { id: liveMatch.id },
      data: { stage: "FirstHalf", status: "InProgress", startTime: new Date() },
    });

    io.emit("timer:start", config.halfDuration);

    const match = await db.match.findFirst({
      where: { isLive: true },
      select: {
        id: true,
        stage: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        homeTeamGoals: { select: { isPenalty: true } },
        awayTeamGoals: { select: { isPenalty: true } },
      },
    });
    io.emit("match:info", match);
  });

  socket.on("match:start-secondHalf", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true },
      select: { id: true },
    });

    if (!liveMatch) return;

    await db.match.update({
      where: { id: liveMatch.id },
      data: {
        stage: "SecondHalf",
        status: "InProgress",
        startTime: new Date(),
      },
    });

    io.emit("timer:start", config.halfDuration);

    const match = await db.match.findFirst({
      where: { isLive: true },
      select: {
        id: true,
        stage: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        homeTeamGoals: { select: { isPenalty: true } },
        awayTeamGoals: { select: { isPenalty: true } },
      },
    });
    io.emit("match:info", match);
  });

  socket.on("match:declare-halftime", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true },
      select: { id: true },
    });

    if (!liveMatch) return;

    await db.match.update({
      where: { id: liveMatch.id },
      data: { stage: "Halftime", status: "InProgress", startTime: new Date() },
    });

    io.emit("timer:stop");

    const match = await db.match.findFirst({
      where: { isLive: true },
      select: {
        id: true,
        stage: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        homeTeamGoals: { select: { isPenalty: true } },
        awayTeamGoals: { select: { isPenalty: true } },
      },
    });
    io.emit("match:info", match);
  });

  socket.on("match:set-extra-time", async (data) => {
    const { extraTime } = data;
    config.extraTimeDuration = extraTime * 60;
  });

  socket.on("match:start-extraTime", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true },
      select: { id: true },
    });

    if (!liveMatch) return;

    await db.match.update({
      where: { id: liveMatch.id },
      data: {
        stage: "ExtraTime",
        status: "InProgress",
        startTime: new Date(),
      },
    });

    io.emit("timer:start", config.extraTimeDuration);

    const match = await db.match.findFirst({
      where: { isLive: true },
      select: {
        id: true,
        stage: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        homeTeamGoals: { select: { isPenalty: true } },
        awayTeamGoals: { select: { isPenalty: true } },
      },
    });
    io.emit("match:info", match);
  });

  socket.on("match:start-penaltyShootout", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true },
      select: { id: true },
    });

    if (!liveMatch) return;

    await db.match.update({
      where: { id: liveMatch.id },
      data: {
        stage: "PenaltyShootout",
        status: "InProgress",
        startTime: new Date(),
      },
    });

    io.emit("timer:stop");

    const match = await db.match.findFirst({
      where: { isLive: true },
      select: {
        id: true,
        stage: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        homeTeamGoals: { select: { isPenalty: true } },
        awayTeamGoals: { select: { isPenalty: true } },
      },
    });
    io.emit("match:info", match);
  });

  socket.on("match:make-goal", async (data) => {
    const { teamId, playerId } = data;

    const liveMatch = await db.match.findFirst({
      where: {
        isLive: true,
        OR: [
          { homeTeam: { id: teamId, players: { some: { id: playerId } } } },
          { awayTeam: { id: teamId, players: { some: { id: playerId } } } },
        ],
      },
      select: {
        id: true,
        stage: true,
        status: true,
        homeTeamId: true,
        awayTeamId: true,
      },
    });

    if (
      !liveMatch ||
      liveMatch.status === "NotStarted" ||
      liveMatch.status === "Finished"
    )
      return;

    const wasHomeTeam = liveMatch.homeTeamId === teamId;

    await db.goal.create({
      data: {
        isPenalty: liveMatch.stage === "PenaltyShootout",
        teamId,
        playerId,
        ...(wasHomeTeam
          ? { matchHomeTeamId: liveMatch.id }
          : { matchAwayTeamId: liveMatch.id }),
      },
    });

    const match = await db.match.findFirst({
      where: { isLive: true },
      select: {
        id: true,
        stage: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        homeTeamGoals: { select: { isPenalty: true } },
        awayTeamGoals: { select: { isPenalty: true } },
      },
    });

    io.emit("match:info", match);

    const goalScorer = await db.player.findFirst({
      where: { id: playerId },
      select: { name: true, team: { select: { name: true } } },
    });

    io.emit("goal:scored", {
      player: goalScorer?.name,
      team: goalScorer?.team.name,
    });
  });

  socket.on("match:finish", async () => {
    const liveMatch = await db.match.findFirst({
      where: { isLive: true },
      select: { id: true },
    });

    if (!liveMatch) return;

    await db.match.update({
      where: { id: liveMatch.id },
      data: { status: "Finished" },
    });

    io.emit("timer:stop");

    const match = await db.match.findFirst({
      where: { isLive: true },
      select: {
        id: true,
        stage: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        homeTeamGoals: { select: { isPenalty: true } },
        awayTeamGoals: { select: { isPenalty: true } },
      },
    });
    io.emit("match:info", match);
  });
});

server.listen(port, () =>
  console.log(`🚀 Server ready at: http://localhost:${port}`)
);
