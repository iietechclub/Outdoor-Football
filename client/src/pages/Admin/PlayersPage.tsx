import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Card from "../../components/Card";
import config from "../../lib/config";

type Team = {
  id: string;
  name: string;
};

type Player = {
  id: string;
  name: string;
  teamId: string;
};

export default function PlayersPage() {
  const [editor, setEditor] = useState<{
    open: boolean;
    mode: "add" | "edit";
    defaultValues: Player | null;
  }>({
    open: false,
    mode: "add",
    defaultValues: null,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState<{
    title: string;
    message: string;
    data: any;
  } | null>(null);

  function onEditorClose() {
    setEditor({ open: false, mode: "add", defaultValues: null });
  }

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/teams`);
      const data = await res.json();
      setTeams(data);
    } catch (e) {
      console.error("Failed to fetch teams", e);
    }
  };

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/players`);
      const data = await res.json();
      setPlayers(data);
    } catch (e) {
      console.error("Failed to fetch players", e);
    } finally {
      setLoading(false);
    }
  };

  async function handleSave(playerData: PlayerFormValues) {
    const payload = {
      name: playerData.name,
      teamId: playerData.teamId,
    };

    if (editor.mode === "add") {
      const res = await fetch(`${config.apiUrl}/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return console.error("Failed to add player");
    } else {
      const res = await fetch(
        `${config.apiUrl}/api/players/${editor.defaultValues?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) return console.error("Failed to update player");
    }

    await fetchPlayers();
    onEditorClose();
  }

  function showDeleteWarning(playerId: string) {
    setShowWarning({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this player? It will remove all his associated goals!",
      data: playerId,
    });
  }

  async function handleDelete(playerId: string) {
    const res = await fetch(`${config.apiUrl}/api/players/${playerId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      return console.error("Failed to delete player");
    }
    fetchPlayers();
  }

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="mb-2 text-2xl font-semibold">Players</h1>
        <button
          className="cursor-pointer rounded-full bg-blue-500 px-4 py-1 text-white"
          onClick={() =>
            setEditor({ open: true, mode: "add", defaultValues: null })
          }
        >
          Add Player
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-xl font-medium text-slate-500">
            Loading players...
          </p>
        </div>
      ) : players.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {players.map(({ id, name, teamId }) => {
            const team = teams.find((t) => t.id === teamId);
            return (
              <Card key={id}>
                <h3 className="mb-1 text-xl font-medium text-slate-800">
                  {name}
                </h3>
                <p className="text-sm text-slate-500">
                  {team?.name ?? "No team"}
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() =>
                      setEditor({
                        open: true,
                        mode: "edit",
                        defaultValues: { id, name, teamId },
                      })
                    }
                    className="cursor-pointer rounded-full bg-blue-500 px-4 py-1 text-sm text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => showDeleteWarning(id)}
                    className="cursor-pointer rounded-full bg-red-500 px-4 py-1 text-sm text-white"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center">
          <p className="text-lg text-slate-500">No players yet</p>
        </div>
      )}

      {editor.open && (
        <PlayerEditModal
          title={editor.mode === "add" ? "Add Player" : "Edit Player"}
          onSave={handleSave}
          onClose={onEditorClose}
          defaultValues={
            editor.defaultValues
              ? {
                  name: editor.defaultValues.name,
                  teamId: editor.defaultValues.teamId,
                  id: editor.defaultValues.id,
                }
              : undefined
          }
          teams={teams}
        />
      )}

      {showWarning && (
        <WarningModal
          title={showWarning.title}
          message={showWarning.message}
          onConfirm={() => {
            handleDelete(showWarning.data);
            setShowWarning(null);
          }}
          onCancel={() => setShowWarning(null)}
        />
      )}
    </div>
  );
}

type PlayerFormValues = {
  id?: string;
  name: string;
  teamId: string;
};

function PlayerEditModal({
  title,
  defaultValues,
  onClose,
  onSave,
  teams,
}: {
  title: string;
  defaultValues?: PlayerFormValues;
  onClose(): void;
  onSave(data: PlayerFormValues): void;
  teams: Team[];
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlayerFormValues>({
    defaultValues,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white px-8 py-6 shadow-lg">
        <h2 className="mb-4 text-center text-lg font-semibold">{title}</h2>
        <form
          onSubmit={handleSubmit((data) => {
            onSave(data);
          })}
        >
          <div className="mb-3">
            <label className="mb-1 block font-medium">Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full rounded border px-3 py-2"
              autoFocus
            />
            {errors.name && (
              <span className="text-red-500">This field is required</span>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-medium">Team</label>
            <select
              {...register("teamId", { required: true })}
              className="w-full rounded border px-3 py-2"
              defaultValue={defaultValues?.teamId ?? ""}
            >
              <option value="">-- Select a team --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.teamId && (
              <span className="text-red-500">This field is required</span>
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

function WarningModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm(): void;
  onCancel(): void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white px-8 py-6 shadow-lg">
        <h2 className="mb-4 text-center text-lg font-semibold">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded bg-gray-200 px-4 py-1"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-red-500 px-4 py-1 text-white"
            onClick={onConfirm}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
