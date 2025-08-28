import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Card from "../../components/Card";
import config from "../../lib/config";

type Team = {
  id: string;
  name: string;
};

export default function TeamsPage() {
  const [editor, setEditor] = useState<{
    open: boolean;
    mode: "add" | "edit";
    defaultValues: Team | null;
  }>({
    open: false,
    mode: "add",
    defaultValues: null,
  });

  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  function onEditorClose() {
    setEditor({ open: false, mode: "add", defaultValues: null });
  }

  const fetchTeams = async () => {
    setLoading(true);
    const res = await fetch(`${config.apiUrl}/api/teams`);
    const data = await res.json();
    setTeams(data);
    setLoading(false);
  };

  async function handleSave(teamData: Team) {
    if (editor.mode === "add") {
      const res = await fetch(`${config.apiUrl}/api/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      });
      if (!res.ok) {
        return console.error("Failed to add team");
      }
    } else {
      const res = await fetch(
        `${config.apiUrl}/api/teams/${editor.defaultValues?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamData),
        },
      );
      if (!res.ok) {
        return console.error("Failed to update team");
      }
    }

    fetchTeams();
    onEditorClose();
  }

  async function handleDelete(teamId: string) {
    const res = await fetch(`${config.apiUrl}/api/teams/${teamId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      return console.error("Failed to delete team");
    }

    fetchTeams();
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="mb-2 text-2xl font-semibold">Teams</h1>
        <button
          className="cursor-pointer rounded-full bg-blue-500 px-4 py-1 text-white"
          onClick={() =>
            setEditor({ open: true, mode: "add", defaultValues: null })
          }
        >
          Add Team
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-xl font-medium text-slate-500">Loading teams...</p>
        </div>
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {teams.map(({ id, name }) => (
            <TeamCard
              key={id}
              name={name}
              onEdit={() =>
                setEditor({
                  open: true,
                  mode: "edit",
                  defaultValues: { id, name },
                })
              }
              onDelete={() => handleDelete(id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center">
          <p className="text-lg text-slate-500">No teams yet</p>
        </div>
      )}

      {editor.open && (
        <TeamEditModal
          title={editor.mode === "add" ? "Add Team" : "Edit Team"}
          onSave={handleSave}
          onClose={onEditorClose}
          defaultValues={editor.defaultValues ?? undefined}
        />
      )}
    </div>
  );
}

type TeamCardProps = {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
};

function TeamCard({ name, onEdit, onDelete }: TeamCardProps) {
  return (
    <Card>
      <h3 className="mb-2 text-xl font-medium text-slate-800">{name}</h3>
      <div className="flex items-center justify-end gap-2">
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

type TeamFormValues = { name: string };

function TeamEditModal({
  title,
  defaultValues,
  onClose,
  onSave,
}: {
  title: string;
  defaultValues?: TeamFormValues;
  onClose(): void;
  onSave(teamData: TeamFormValues): void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormValues>({
    defaultValues,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white px-8 py-6 shadow-lg">
        <h2 className="mb-4 text-center text-lg font-semibold">{title}</h2>
        <form onSubmit={handleSubmit((data) => onSave(data))}>
          <div className="mb-4">
            <label className="mb-1 block font-medium">Team Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full rounded border px-3 py-2"
              autoFocus
            />
            {errors.name && (
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
