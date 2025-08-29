import { useEffect, useState } from "react";
import MainContainer from "../../containers/main-container";

import config from "../../lib/config";
import { useForm } from "react-hook-form";
import useTimer from "../../hooks/useTimer";
import { useSocket } from "../../context/SocketProvider";

type Match = {
  id: string;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  homeTeamGoals: { isPenalty: boolean }[];
  awayTeamGoals: { isPenalty: boolean }[];
};

type Player = { id: string; name: string };

type GoalFormValues = {
  teamId: string;
  playerId: string;
};

export default function LiveMatchPage() {
  const timer = useTimer();
  const { socket } = useSocket();
  const [match, setMatch] = useState<Match | "loading" | "not-live">("loading");

  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Player[]>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Player[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GoalFormValues>();

  const extraTime = useForm<{ extraTime: number }>();

  function onGoalSubmit(data: GoalFormValues) {
    socket?.emit("match:make-goal", data);
  }

  function onExtraTimeSubmit(data: { extraTime: number }) {
    socket?.emit("match:set-extra-time", data);
  }

  useEffect(() => {
    if (!socket) return;

    socket.emit("match:request");
    socket.on("match:info", async (matchInfo) => {
      if (!matchInfo) return setMatch("not-live");
      setMatch(matchInfo);

      if ("homeTeam" in matchInfo && "awayTeam" in matchInfo) {
        const [homeTeamPlayers, awayTeamPlayers] = await Promise.all([
          fetch(
            `${config.apiUrl}/api/players/team/${matchInfo.homeTeam.id}`,
          ).then((res) => res.json()),
          fetch(
            `${config.apiUrl}/api/players/team/${matchInfo.awayTeam.id}`,
          ).then((res) => res.json()),
        ]);

        setHomeTeamPlayers(homeTeamPlayers);
        setAwayTeamPlayers(awayTeamPlayers);
      }
    });

    return () => {
      socket.off("match:info");
    };
  }, [socket]);

  const selectedTeamId = watch("teamId");
  const players =
    selectedTeamId && typeof match !== "string"
      ? selectedTeamId === match.homeTeam.id
        ? homeTeamPlayers
        : awayTeamPlayers
      : [];

  return (
    <MainContainer>
      <h1 className="text-2xl font-bold">Live Match</h1>
      <p className="text-slate-500">
        Details about the live match will be displayed here.
      </p>

      <div>
        <p>
          Match ID:{" "}
          {match === "loading"
            ? "Loading..."
            : match === "not-live"
              ? "Not Live"
              : match.id}
        </p>

        <p>Timer: {timer}</p>

        <div className="flex gap-3">
          <p>
            Goals:{" "}
            {match === "loading" ? (
              "Loading..."
            ) : match === "not-live" ? (
              "Not Live"
            ) : (
              <>
                {match.homeTeamGoals.filter((g) => !g.isPenalty).length}
                {" - "}
                {match.awayTeamGoals.filter((g) => !g.isPenalty).length}
              </>
            )}
          </p>
          |
          <p>
            Penalty:{" "}
            {match === "loading" ? (
              "Loading..."
            ) : match === "not-live" ? (
              "Not Live"
            ) : (
              <>
                {match.homeTeamGoals.filter((g) => g.isPenalty).length}
                {" - "}
                {match.awayTeamGoals.filter((g) => g.isPenalty).length}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className="mt-4 rounded bg-red-500 px-4 py-2 text-white"
          onClick={() => socket?.emit("match:pause")}
        >
          Pause Match
        </button>
        <button
          className="mt-4 rounded bg-green-500 px-4 py-2 text-white"
          onClick={() => socket?.emit("match:resume")}
        >
          Resume Match
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
          onClick={() => socket?.emit("match:start-firstHalf")}
        >
          Start First Half
        </button>
        <button
          className="cursor-pointer rounded bg-indigo-500 px-4 py-2 text-white"
          onClick={() => socket?.emit("match:start-secondHalf")}
        >
          Start Second Half
        </button>
        <button
          className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white"
          onClick={() => socket?.emit("match:declare-halftime")}
        >
          Declare Halftime
        </button>
        <button
          className="cursor-pointer rounded bg-amber-600 px-4 py-2 text-white"
          onClick={() => socket?.emit("match:start-extraTime")}
        >
          Start Extra Time
        </button>
        <button
          className="cursor-pointer rounded bg-lime-800 px-4 py-2 text-white"
          onClick={() => socket?.emit("match:start-penaltyShootout")}
        >
          Start Penalty Shootout
        </button>
        <button
          className="cursor-pointer rounded bg-neutral-600 px-4 py-2 text-white"
          onClick={() => socket?.emit("match:finish")}
        >
          Finish Match
        </button>
      </div>

      {typeof match !== "string" && (
        <form onSubmit={handleSubmit(onGoalSubmit)} className="mb-10">
          <h3 className="mb-2 text-center text-2xl font-bold">Make Goals</h3>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-medium">Team</label>
              <select
                {...register("teamId", { required: true })}
                className="w-full rounded border px-3 py-2"
              >
                <option value="">Select team</option>
                <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
                <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
              </select>
              {errors.teamId && <span className="text-red-500">Required</span>}
            </div>
            <div>
              <label className="mb-1 block font-medium">Player</label>
              <select
                {...register("playerId", { required: true })}
                className="w-full rounded border px-3 py-2"
              >
                <option value="">Select player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
              {errors.playerId && (
                <span className="text-red-500">Required</span>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      <div>
        <form
          onSubmit={extraTime.handleSubmit(onExtraTimeSubmit)}
          className="mb-10"
        >
          <h3 className="mb-2 text-center text-2xl font-bold">
            Set Extra Time
          </h3>

          <div className="flex items-end gap-2">
            <div>
              <label className="mb-1 block font-medium">Extra Time</label>
              <input
                type="number"
                defaultValue={0}
                {...extraTime.register("extraTime", { required: true })}
                className="w-full rounded border px-3 py-2"
                min={0}
              />
              {extraTime.formState.errors.extraTime && (
                <span className="text-red-500">Required</span>
              )}
            </div>

            <button
              type="submit"
              className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </MainContainer>
  );
}
