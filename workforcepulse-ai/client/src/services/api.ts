import type { ForecastPoint, Insight, OccupationRecord, ScenarioResult, SkillGapRecord, SummaryMetric } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export function getSummary() {
  return request<{ metrics: SummaryMetric[] }>("/api/analytics/summary");
}

export function getOccupations() {
  return request<{ occupations: OccupationRecord[] }>("/api/analytics/occupations");
}

export function getForecast(occupationId: string) {
  return request<{ occupation: OccupationRecord; forecast: ForecastPoint[] }>(`/api/analytics/forecast/${occupationId}`);
}

export function getSkills() {
  return request<{ skills: SkillGapRecord[] }>("/api/analytics/skills");
}

export function getInsights() {
  return request<{ insights: Insight[] }>("/api/analytics/insights");
}

export function runScenario(payload: { occupationIds: string[]; trainingSeats: number; months: number; region?: string }) {
  return request<{ scenario: ScenarioResult }>("/api/analytics/scenario", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
