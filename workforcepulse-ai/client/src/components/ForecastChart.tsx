import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ForecastPoint, OccupationRecord } from "../types";

interface ForecastChartProps {
  forecast: ForecastPoint[];
  occupation?: OccupationRecord;
}

export function ForecastChart({ forecast, occupation }: ForecastChartProps) {
  return (
    <section className="panel largePanel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Predictive analytics</p>
          <h2>Demand forecast</h2>
        </div>
        {occupation && <span className="tag">{occupation.title}</span>}
      </div>

      <div className="chartBox">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={forecast} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 110]} />
            <Tooltip />
            <Area type="monotone" dataKey="actual" name="Actual demand" stroke="#2563eb" fill="#bfdbfe" strokeWidth={3} />
            <Area type="monotone" dataKey="predicted" name="Predicted demand" stroke="#7c3aed" fill="#ddd6fe" strokeWidth={3} />
            <Area type="monotone" dataKey="upperBound" name="Upper confidence" stroke="#94a3b8" fill="transparent" strokeDasharray="5 5" />
            <Area type="monotone" dataKey="lowerBound" name="Lower confidence" stroke="#94a3b8" fill="transparent" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
