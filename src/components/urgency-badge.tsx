import type { Urgency } from "@/lib/mock-leads";

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const isHot = urgency === "quente";

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        isHot
          ? "bg-accent/20 text-accent"
          : "bg-amber-500/15 text-amber-400"
      }`}
    >
      {isHot ? "Quente" : "Morno"}
    </span>
  );
}
