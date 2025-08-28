import config from "../lib/config";

export default function Footer() {
  return (
    <footer className="fixed right-0 bottom-0 left-0 z-10 border-t border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-600">
          <span>Created with ❤️ by </span>
          <span className="font-medium text-slate-800">{config.createdBy}</span>
        </p>
      </div>
    </footer>
  );
}
