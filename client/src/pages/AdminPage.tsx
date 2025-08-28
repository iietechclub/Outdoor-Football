import { useEffect, useState } from "react";
import MainContainer from "../containers/main-container";

import LiveMatchPage from "./Admin/LiveMatchPage";
import MatchesPage from "./Admin/MatchesPage";
import TeamsPage from "./Admin/TeamsPage";
import PlayersPage from "./Admin/PlayersPage";

type Tabs = "live-match" | "matches" | "teams" | "players";

export default function AdminPage() {
  const [tabId, setTabId] = useState<Tabs>("live-match");

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const password = prompt("Enter admin password:");
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Access denied. Incorrect password.");
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <MainContainer>
        <div className="flex h-64 items-center justify-center">
          <p className="font-semibold text-red-600">Access Denied</p>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <div className="mb-4 flex space-x-4 border-b border-blue-400">
        <TabButton label="Live Match" onClick={() => setTabId("live-match")} />
        <TabButton label="Matches" onClick={() => setTabId("matches")} />
        <TabButton label="Teams" onClick={() => setTabId("teams")} />
        <TabButton label="Players" onClick={() => setTabId("players")} />
      </div>

      <div className="">
        {tabId === "live-match" && <LiveMatchPage />}
        {tabId === "matches" && <MatchesPage />}
        {tabId === "teams" && <TeamsPage />}
        {tabId === "players" && <PlayersPage />}
      </div>
    </MainContainer>
  );
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string };

const TabButton = ({ label, ...props }: Props) => {
  return (
    <button
      className="cursor-pointer rounded-t-md bg-white px-4 py-2 font-semibold text-blue-600 shadow"
      {...props}
    >
      {label}
    </button>
  );
};
