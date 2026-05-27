export type Tone = "positive" | "warning" | "neutral";

export interface SummaryMetric {
  label: string;
  value: string;
  change: string;
  tone: Tone;
}

export interface OccupationRecord {
  id: string;
  title: string;
  category: string;
  region: string;
  currentDemand: number;
  previousDemand: number;
  vacancies: number;
  avgSalary: number;
  automationExposure: number;
  remoteFriendly: number;
  growthRate: number;
  monthlyTrend: number[];
  demandDrivers: string[];
  requiredSkills: string[];
}

export interface SkillGapRecord {
  skill: string;
  currentSupply: number;
  projectedDemand: number;
  relatedOccupations: string[];
  gap: number;
  gapScore: number;
  priority: "Critical" | "High" | "Medium";
}

export interface ForecastPoint {
  month: string;
  actual?: number;
  predicted?: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface Insight {
  title: string;
  description: string;
  impact: string;
}

export interface ScenarioResult {
  projectedFilledRoles: number;
  remainingGap: number;
  roiScore: number;
  recommendedAction: string;
  affectedSkills: Array<{
    skill: string;
    beforeGap: number;
    afterGap: number;
  }>;
}
