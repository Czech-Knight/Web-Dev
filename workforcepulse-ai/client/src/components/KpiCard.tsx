import type { SummaryMetric } from "../types";

interface KpiCardProps {
  metric: SummaryMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  return (
    <article className={`kpiCard ${metric.tone}`}>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      <p>{metric.change}</p>
    </article>
  );
}
