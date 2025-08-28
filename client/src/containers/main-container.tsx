import { cn } from "../lib/utils";

export default function MainContainer({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(className, "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8")}
    >
      {children}
    </main>
  );
}
