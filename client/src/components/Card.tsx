import React from "react";
import { cn } from "../lib/utils";

export default function Card({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        className,
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6",
      )}
    >
      {children}
    </div>
  );
}
