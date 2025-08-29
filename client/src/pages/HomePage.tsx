import { useEffect, useState } from "react";
import useTimer from "../hooks/useTimer";
import { useSocket } from "../context/SocketProvider";

import { cn } from "../lib/utils";
import MainContainer from "../containers/main-container";

import Card from "../components/Card";

type Match = {
  id: string;
  stage: string;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
};
type Scores = {
  home: number;
  away: number;
};

export default function HomePage() {
  const timer = useTimer();
  const { socket } = useSocket();

  const [match, setMatch] = useState<Match | null>(null);
  const [scores, setScores] = useState<Scores>({
    home: 0,
    away: 0,
  });
  const [penaltyScores, setPenaltyScores] = useState<Scores | null>(null);
  const [notification, setNotification] = useState<{
    player: string;
    team: string;
  } | null>(null);

  useEffect(() => {
    if (!socket) return;
    let id: number | null = null;

    socket.emit("match:request");
    socket.on("match:info", (matchInfo) => {
      if (!matchInfo) return setMatch(null);

      setMatch(matchInfo);
      setScores({
        home: matchInfo.homeTeamGoals.filter((goal: any) => !goal.isPenalty)
          .length,
        away: matchInfo.awayTeamGoals.filter((goal: any) => !goal.isPenalty)
          .length,
      });

      const penaltyScores = {
        home: matchInfo.homeTeamGoals.filter((goal: any) => goal.isPenalty)
          .length,
        away: matchInfo.awayTeamGoals.filter((goal: any) => goal.isPenalty)
          .length,
      };

      if (penaltyScores.away > 0 || penaltyScores.home > 0) {
        setPenaltyScores(penaltyScores);
      }
    });

    socket.on("goal:scored", ({ player, team }) => {
      setNotification({ player, team });
      id = setTimeout(() => {
        setNotification(null);
        if (id) {
          clearTimeout(id);
          id = null;
        }
      }, 6000);
    });

    return () => {
      socket.off("match:info");
      socket.off("goal:scored");
      if (id) clearTimeout(id);
    };
  }, [socket]);

  if (!match)
    return (
      <MainContainer>
        <Card className="flex h-60 flex-col items-center justify-center space-y-2">
          <div className="mb-4 flex flex-col items-center justify-center">
            <svg
              className="mb-3 size-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-xl font-semibold text-slate-800">
              No live match
            </h3>
          </div>
          <p className="text-center text-slate-600">
            There's no match currently being played. Check back later for live
            updates.
          </p>
        </Card>
      </MainContainer>
    );

  return (
    <MainContainer>
      <div className="relative">
        {notification && (
          <div className="absolute top-0 left-0 z-10 rounded-xl border border-green-600 bg-green-50 px-5 py-2 font-medium shadow-lg">
            Goal by <span className="text-blue-600">{notification.player}</span>{" "}
            from <span className="text-green-600">{notification.team}</span>.
          </div>
        )}
      </div>

      <Card className="space-y-4">
        <div className="flex justify-center">
          <span className="inline-flex shrink-0 items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-slate-800">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-slate-600">LIVE</span>
            </div>
          </span>
        </div>

        <div className="mb-6 grid grid-cols-3 items-center gap-4 sm:mb-8">
          <TeamBanner name={match?.homeTeam.name ?? "Home Team"} />

          <div className="text-center">
            <div className="mb-3 flex items-center justify-center space-x-2 sm:space-x-4">
              <div className="text-2xl font-bold text-blue-600 sm:text-4xl">
                {scores.home}
              </div>
              <div className="text-lg font-medium text-slate-400 sm:text-xl">
                -
              </div>
              <div className="text-2xl font-bold text-red-600 sm:text-4xl">
                {scores.away}
              </div>
            </div>
            <div className="text-xs font-medium tracking-wide text-slate-500 uppercase sm:text-sm">
              Live Score
            </div>

            <div className="mt-1">
              {penaltyScores && (
                <p className="text-sm font-medium tracking-wide text-slate-400">
                  Penalty: {penaltyScores?.home ?? 0}
                  {" - "}
                  {penaltyScores?.away ?? 0}
                </p>
              )}
            </div>
          </div>

          <TeamBanner name={match?.awayTeam.name ?? "Away Team"} color="red" />
        </div>

        <div>
          <p className="mb-2 text-center text-sm font-medium tracking-wide text-slate-400">
            {match?.stage ?? "Match Stage"}
          </p>
          <div className="flex justify-center">
            <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2 text-white shadow-sm">
              <div className="text-center">
                <div className="rounded-lg bg-transparent px-0 py-0 font-mono text-xl font-bold text-white sm:text-2xl md:text-3xl">
                  {timer}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </MainContainer>
  );
}

type TeamBannerProps = {
  name: string;
  color?: "blue" | "red";
};

const TeamBanner = ({ name, color = "blue" }: TeamBannerProps) => {
  return (
    <div
      className={cn("rounded-lg border p-4 transition-colors duration-200", {
        "border-red-100 bg-red-50 hover:border-red-200 hover:bg-red-100":
          color === "red",
        "border-blue-100 bg-blue-50 hover:border-blue-200 hover:bg-blue-100":
          color === "blue",
      })}
    >
      <div
        className={cn(
          "mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white sm:h-12 sm:w-12 sm:text-lg md:h-16 md:w-16 md:text-xl",
          color === "red" && "bg-red-600",
          color === "blue" && "bg-blue-600",
        )}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <h3 className="text-center text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600 sm:text-base">
        {name}
      </h3>
    </div>
  );
};
