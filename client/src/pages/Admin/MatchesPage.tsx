import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Card from "../../components/Card";
import config from "../../lib/config";

type Team = {
  id: string;
  name: string;
};

type Match = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string;
};

export default function MatchesPage() {
  const [editor, setEditor] = useState<{
    open: boolean;
    mode: "add" | "edit";
    defaultValues: Match | null;
  }>({
    open: false,
    mode: "add",
    defaultValues: null,
  });

  const [_matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchTeams() {
    try {
      const res = await fetch(`${config.apiUrl}/api/teams`);
      const data = await res.json();
      setTeams(data ?? []);
    } catch (err) {
      console.error("Failed to fetch teams", err);
    }
  }

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/matches`);
      const data = await res.json();
      setMatches(data ?? []);
    } catch (err) {
      console.error("Failed to fetch matches", err);
    } finally {
      setLoading(false);
    }
  };

  function onEditorClose() {
    setEditor({ open: false, mode: "add", defaultValues: null });
  }

  async function handleSave(matchData: Omit<Match, "id">) {
    try {
      if (editor.mode === "add") {
        const res = await fetch(`${config.apiUrl}/api/matches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(matchData),
        });
        if (!res.ok) {
          console.error("Failed to add match");
          return;
        }
      } else {
        const id = editor.defaultValues?.id;
        const res = await fetch(`${config.apiUrl}/api/matches/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(matchData),
        });
        if (!res.ok) {
          console.error("Failed to update match");
          return;
        }
      }
      await fetchMatches();
      onEditorClose();
    } catch (err) {
      console.error("Save failed", err);
    }
  }

  async function handleDelete(matchId: string) {
    try {
      const res = await fetch(`${config.apiUrl}/api/matches/${matchId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Failed to delete match");
        return;
      }
      await fetchMatches();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  async function handleLive(matchId: string) {
    try {
      const res = await fetch(`${config.apiUrl}/api/live/${matchId}`, {
        method: "POST",
      });
      if (!res.ok) {
        console.error("Failed to start live match");
        return;
      }
      await fetchMatches();
    } catch (err) {
      console.error("Live match failed", err);
    }
  }

  useEffect(() => {
    fetchTeams();
    fetchMatches();
  }, []);

  const matches = React.useMemo(
    () =>
      _matches.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    [_matches],
  );

  const teamsById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const t of teams) map.set(t.id, t.name);
    return map;
  }, [teams]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="mb-2 text-2xl font-semibold">Matches</h1>
        <button
          className="cursor-pointer rounded-full bg-blue-500 px-4 py-1 text-white"
          onClick={() =>
            setEditor({
              open: true,
              mode: "add",
              defaultValues: null,
            })
          }
        >
          Add Match
        </button>
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-xl font-medium text-slate-500">
            Loading matches...
          </p>
        </div>
      ) : matches.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-lg text-slate-500">No matches yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              homeName={teamsById.get(m.homeTeamId) ?? "Unknown"}
              awayName={teamsById.get(m.awayTeamId) ?? "Unknown"}
              onLive={() => handleLive(m.id)}
              onEdit={() =>
                setEditor({ open: true, mode: "edit", defaultValues: m })
              }
              onDelete={() => handleDelete(m.id)}
            />
          ))}
        </div>
      )}

      {editor.open && (
        <MatchEditModal
          title={editor.mode === "add" ? "Add Match" : "Edit Match"}
          teams={teams}
          defaultValues={editor.defaultValues ?? undefined}
          onSave={(data) => handleSave(data)}
          onClose={onEditorClose}
        />
      )}
    </div>
  );
}

const formatToScheduleDate = (date: Date | string) => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function MatchCard({
  match,
  homeName,
  awayName,
  onLive,
  onEdit,
  onDelete,
}: {
  match: Match;
  homeName: string;
  awayName: string;
  onLive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <div className="mb-4 space-y-2">
        <h3 className="text-xl font-medium text-slate-800">
          {homeName}{" "}
          <span className="font-bold text-indigo-600 italic">VS</span>{" "}
          {awayName}
        </h3>

        {match.scheduledAt && (
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-blue-400">Scheduled At: </span>
            <span className="font-medium">
              {formatToScheduleDate(match.scheduledAt)}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onLive}
          className="cursor-pointer rounded-full bg-green-500 px-4 py-1 text-sm text-white"
        >
          Live
        </button>
        <button
          onClick={onEdit}
          className="cursor-pointer rounded-full bg-blue-500 px-4 py-1 text-sm text-white"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="cursor-pointer rounded-full bg-red-500 px-4 py-1 text-sm text-white"
        >
          Delete
        </button>
      </div>
    </Card>
  );
}

type MatchFormValues = {
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string; // ISO or local datetime string
};

function formatToInputDateValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  // return "YYYY-MM-DDTHH:MM" for datetime-local
  const pad = (n: number) => n.toString().padStart(2, "0");
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
}

function MatchEditModal({
  title,
  defaultValues,
  teams,
  onClose,
  onSave,
}: {
  title: string;
  defaultValues?: MatchFormValues;
  teams: Team[];
  onClose(): void;
  onSave(data: Omit<Match, "id">): void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchFormValues>({
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          scheduledAt: formatToInputDateValue(defaultValues.scheduledAt),
        }
      : undefined,
  });

  const submit = (data: MatchFormValues) => {
    if (data.homeTeamId === data.awayTeamId) {
      alert("Home and away team must be different");
      return;
    }
    // convert datetime-local value back to ISO string
    const isoDate = new Date(data.scheduledAt).toISOString();
    onSave({
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      scheduledAt: isoDate,
      id: "", // id will be ignored for new; caller handles put path for edits
    } as Omit<Match, "id">);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white px-8 py-6 shadow-lg">
        <h2 className="mb-4 text-center text-lg font-semibold">{title}</h2>
        <form onSubmit={handleSubmit(submit)}>
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">Home Team</label>
              <select
                {...register("homeTeamId", { required: true })}
                className="w-full rounded border px-3 py-2"
              >
                <option value="">Select team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.homeTeamId && (
                <span className="text-red-500">Required</span>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium">Away Team</label>
              <select
                {...register("awayTeamId", { required: true })}
                className="w-full rounded border px-3 py-2"
              >
                <option value="">Select team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.awayTeamId && (
                <span className="text-red-500">Required</span>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-1 block font-medium">Date & Time</label>
            <input
              {...register("scheduledAt", { required: true })}
              type="datetime-local"
              className="w-full rounded border px-3 py-2"
            />
            {errors.scheduledAt && (
              <span className="text-red-500">Required</span>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded bg-gray-200 px-4 py-1"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-1 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
