import { Activity, ArrowRight, Clock3 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { APP_FACILITY_NAME, APP_LINE_NAME } from "@/lib/app-config";

type SecondaryPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

export function SecondaryPage({ eyebrow, title, description, bullets }: SecondaryPageProps) {
  return (
    <AppShell
      generatedAt={new Date().toISOString()}
      facilityName={APP_FACILITY_NAME}
      lineName={APP_LINE_NAME}
    >
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p>
          <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <Activity className="h-4 w-4 text-slate-500" />
              Purpose
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {bullets.map((bullet) => (
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
              Take-home note
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              This page is intentionally lightweight. It gives the navigation real destinations and a believable product structure without overbuilding beyond the assignment scope.
            </p>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">Current scope</div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              The production-line report remains the primary implemented experience. These pages show how the information architecture can scale inside the same application shell.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
