import { Activity, ArrowRight, Clock3 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import type { SecondaryPageContent, ShellContent } from "@/types/content";

type SecondaryPageProps = {
  content: SecondaryPageContent;
  shellContent: ShellContent;
};

export function SecondaryPage({ content, shellContent }: SecondaryPageProps) {
  return (
    <AppShell
      generatedAt={new Date().toISOString()}
      facilityName={shellContent.brand.defaultFacilityName}
      lineName={shellContent.brand.defaultLineName}
      shellContent={shellContent}
    >
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{content.eyebrow}</p>
          <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">{content.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{content.description}</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <Activity className="h-4 w-4 text-slate-500" />
              {content.panels.purposeTitle}
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {content.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <Clock3 className="h-4 w-4 text-slate-500" />
              {content.panels.noteTitle}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {content.panels.noteBody}
            </p>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">{content.panels.scopeTitle}</div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {content.panels.scopeBody}
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
