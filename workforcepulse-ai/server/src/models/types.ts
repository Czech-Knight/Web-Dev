export type Region = "VIC" | "NSW" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";

export interface OccupationRecord {
  id: string;
  title: string;
  category: string;
  region: Region;
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

export interface SkillRecord {
  skill: string;
  currentSupply: number;
  projectedDemand: number;
  relatedOccupations: string[];
}

export interface ForecastPoint {
  month: string;
  actual?: number;
  predicted?: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface SummaryMetric {
  label: string;
  value: string;
  change: string;
  tone: "positive" | "warning" | "neutral";
}

export interface ScenarioRequest {
  occupationIds: string[];
  trainingSeats: number;
  months: number;
  region?: Region;
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
