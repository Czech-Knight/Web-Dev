import type { ForecastPoint, OccupationRecord, SummaryMetric } from "../models/types.js";
import { occupations } from "../data/labourMarket.js";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function linearRegression(values: number[]) {
  const n = values.length;
  const xs = values.map((_, index) => index + 1);
  const sumX = xs.reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = xs.reduce((sum, x, index) => sum + x * values[index], 0);
  const sumXX = xs.reduce((sum, x) => sum + x * x, 0);
  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function buildForecast(occupation: OccupationRecord, months = 6): ForecastPoint[] {
  const { slope, intercept } = linearRegression(occupation.monthlyTrend);

  const history: ForecastPoint[] = occupation.monthlyTrend.map((value, index) => ({
    month: monthLabels[index] ?? `M${index + 1}`,
    actual: value
  }));

  const predictions: ForecastPoint[] = Array.from({ length: months }, (_, index) => {
    const x = occupation.monthlyTrend.length + index + 1;
    const prediction = Math.max(0, Math.round(intercept + slope * x));
    const uncertainty = Math.max(4, Math.round(prediction * (0.06 + index * 0.01)));

    return {
      month: `+${index + 1}M`,
      predicted: prediction,
      lowerBound: Math.max(0, prediction - uncertainty),
      upperBound: prediction + uncertainty
    };
  });

  return [...history, ...predictions];
}

export function getOccupationById(id: string): OccupationRecord | undefined {
  return occupations.find((occupation) => occupation.id === id);
}

export function buildSummaryMetrics(): SummaryMetric[] {
  const totalVacancies = occupations.reduce((sum, occupation) => sum + occupation.vacancies, 0);
  const averageGrowth = occupations.reduce((sum, occupation) => sum + occupation.growthRate, 0) / occupations.length;
  const topOccupation = [...occupations].sort((a, b) => b.currentDemand - a.currentDemand)[0];
  const averageRemoteFriendly = occupations.reduce((sum, occupation) => sum + occupation.remoteFriendly, 0) / occupations.length;

  return [
    {
      label: "Tracked Vacancies",
      value: totalVacancies.toLocaleString("en-AU"),
      change: "+12.4% simulated YoY",
      tone: "positive"
    },
    {
      label: "Average Demand Growth",
      value: `${averageGrowth.toFixed(1)}%`,
      change: "Across priority roles",
      tone: "positive"
    },
    {
      label: "Highest Demand Role",
      value: topOccupation.title,
      change: `${topOccupation.currentDemand}/100 demand score`,
      tone: "warning"
    },
    {
      label: "Remote Readiness",
      value: `${Math.round(averageRemoteFriendly)}%`,
      change: "Weighted role flexibility",
      tone: "neutral"
    }
  ];
}
