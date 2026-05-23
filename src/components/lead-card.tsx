import type { LeadResult } from "@/lib/mock-leads";
import { UrgencyBadge } from "@/components/urgency-badge";

type LeadCardProps = {
  lead: LeadResult;
  onViewMessage: (message: string) => void;
};

export function LeadCard({ lead, onViewMessage }: LeadCardProps) {
  return (
    <li className="rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-card-hover">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug">{lead.title}</h3>
        <UrgencyBadge urgency={lead.urgency} />
      </div>

      <p className="mt-2 text-sm text-muted">{lead.subreddit}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={lead.redditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:border-accent/50 hover:text-accent transition-colors"
        >
          Abrir no Reddit
        </a>
        <button
          type="button"
          onClick={() => onViewMessage(lead.suggestedMessage)}
          className="rounded-xl bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
        >
          Ver mensagem sugerida
        </button>
      </div>
    </li>
  );
}
