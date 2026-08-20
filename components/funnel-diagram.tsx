"use client";

import Link from "next/link";

export type FunnelStep = {
  label: string;
  value: string;
  href: string;
  hint?: string;
  lit?: boolean;
};

export function FunnelDiagram({
  title,
  steps,
  className = "mt-6",
}: {
  title?: string;
  steps: FunnelStep[];
  className?: string;
}) {
  return (
    <div className={className}>
      {title && <p className="mb-3 text-sm font-semibold">{title}</p>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className="rounded-2xl bg-white/8 px-4 py-4 hover:bg-white/12"
          >
            <p className="text-sm font-semibold">{step.label}</p>
            {step.hint && <p className="mt-0.5 text-xs text-white/50">{step.hint}</p>}
            <p className="mt-3 text-2xl font-bold tracking-tight">{step.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
