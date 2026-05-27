import { describe, expect, it } from "vitest";
import { occupations } from "../src/data/labourMarket.js";
import { buildForecast, buildSummaryMetrics } from "../src/services/forecastService.js";
import { buildSkillGapRanking } from "../src/services/skillService.js";
import { runScenario } from "../src/services/scenarioService.js";

describe("forecast service", () => {
  it("returns historical and predicted forecast points", () => {
    const forecast = buildForecast(occupations[0], 6);

    expect(forecast).toHaveLength(18);
    expect(forecast[0].actual).toBeDefined();
    expect(forecast[17].predicted).toBeDefined();
  });

  it("builds four dashboard summary metrics", () => {
    const metrics = buildSummaryMetrics();

    expect(metrics).toHaveLength(4);
    expect(metrics[0].label).toBe("Tracked Vacancies");
  });
});

describe("skill service", () => {
  it("sorts skill gaps by priority score", () => {
    const ranking = buildSkillGapRanking();

    expect(ranking[0].gapScore).toBeGreaterThanOrEqual(ranking[ranking.length - 1].gapScore);
  });
});

describe("scenario service", () => {
  it("produces a workforce intervention result", () => {
    const scenario = runScenario({
      occupationIds: ["fs-dev", "ml-eng"],
      trainingSeats: 120,
      months: 12,
      region: "VIC"
    });

    expect(scenario.projectedFilledRoles).toBeGreaterThan(0);
    expect(scenario.affectedSkills.length).toBeGreaterThan(0);
  });
});
