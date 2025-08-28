import config from "../lib/config";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex shrink-0 items-center space-x-4">
            <img className="size-12" src="/logo.png" alt="Logo" />
            <div>
              <h1 className="truncate font-semibold text-slate-900 sm:text-lg md:text-xl">
                {config.institutionName}
              </h1>
              <p className="text-xs text-slate-600">
                <span className="italic">Organized by - </span>
                <span className="font-medium">{config.organizedBy}</span>
              </p>
            </div>
          </div>

          <div className="flex grow justify-center sm:grow-0">
            <p className="shrink-0 rounded-full bg-indigo-50 px-4 py-2 text-xs font-medium text-indigo-600 sm:text-sm">
              {config.tournamentName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
