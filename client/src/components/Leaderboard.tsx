import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import config from "../lib/config";

type Team = {
  id: string;
  name: string;
  points: number;
  goalDifference: number;
};

export default function Leaderboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    const response = await fetch(`${config.apiUrl}/api/teams/leaderboard`);
    const data = await response.json();
    setTeams(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="mb-14 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:mb-20">
      <div className="border-b border-slate-300 bg-slate-50 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
          🏆 Tournament Leaderboard
        </h3>
      </div>
      <div className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {teams.length > 0 ? (
            <table className="w-full divide-y divide-slate-200">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase sm:px-6">
                    <span className="ml-12">Team</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase sm:px-6">
                    Points
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase sm:px-6">
                    GD
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {teams.map((team, idx) => (
                  <TableRow
                    key={team.id}
                    team={team.name}
                    pos={idx + 1}
                    points={team.points}
                    goalDifference={team.goalDifference}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-4 text-slate-400">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                {loading ? "Loading teams data..." : "No Teams Available"}
              </h3>
              <p className="text-slate-600">
                The tournament leaderboard is currently empty. Teams will appear
                here once matches begin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TableRow({
  team,
  pos,
  points,
  goalDifference,
}: {
  team: string;
  pos: number;
  points: number;
  goalDifference: number;
}) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-slate-50",
        pos === 1 && "bg-yellow-50",
      )}
    >
      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-start space-x-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full bg-slate-50",
                pos === 1 && "bg-yellow-100",
                pos === 2 && "bg-slate-100",
                pos === 3 && "bg-orange-100",
              )}
            >
              <span
                className={cn(
                  "text-sm font-bold text-slate-700",
                  pos === 1 && "text-yellow-800",
                  pos === 2 && "text-slate-600",
                  pos === 3 && "text-orange-800",
                )}
              >
                {pos}
              </span>
            </div>
          </div>
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
            {team.charAt(0).toUpperCase()}
          </div>
          <span
            className="text-sm font-medium text-slate-900 transition-colors hover:text-blue-600"
            data-discover="true"
          >
            {team}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-center whitespace-nowrap sm:px-6">
        <span className="text-sm font-medium text-blue-600">{points} pts</span>
      </td>
      <td className="px-4 py-4 text-center whitespace-nowrap sm:px-6">
        <span
          className={cn(
            "text-sm font-medium",
            goalDifference > 0 && "text-green-600",
            goalDifference === 0 && "text-slate-600",
            goalDifference < 0 && "text-red-600",
          )}
        >
          {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
        </span>
      </td>
    </tr>
  );
}
