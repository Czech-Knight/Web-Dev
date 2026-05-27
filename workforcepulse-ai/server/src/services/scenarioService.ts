import type { ScenarioRequest, ScenarioResult } from "../models/types.js";
import { occupations, skills } from "../data/labourMarket.js";

export function runScenario(request: ScenarioRequest): ScenarioResult {
  const selectedOccupations = occupations.filter((occupation) =>
    request.occupationIds.includes(occupation.id) && (!request.region || occupation.region === request.region)
  );

  const selectedSkillNames = new Set(selectedOccupations.flatMap((occupation) => occupation.requiredSkills));
  const relevantSkills = skills.filter((skill) => selectedSkillNames.has(skill.skill));
  const monthlyMultiplier = Math.min(Math.max(request.months, 1), 24) / 12;
  const totalGapBefore = relevantSkills.reduce((sum, skill) => sum + Math.max(skill.projectedDemand - skill.currentSupply, 0), 0);
  const trainingEffect = Math.round(request.trainingSeats * 0.72 * monthlyMultiplier);
  const remainingGap = Math.max(0, totalGapBefore - trainingEffect);
  const projectedFilledRoles = Math.min(trainingEffect, totalGapBefore);
  const roiScore = totalGapBefore === 0 ? 100 : Math.round((projectedFilledRoles / totalGapBefore) * 100);

  return {
    projectedFilledRoles,
    remainingGap,
    roiScore,
    recommendedAction:
      roiScore >= 75
        ? "Scale the training program and connect graduates directly to high-demand roles."
        : roiScore >= 40
          ? "Increase training seats or extend the program duration to reduce the remaining gap."
          : "Refocus the program on fewer priority skills before scaling.",
    affectedSkills: relevantSkills.map((skill) => {
      const beforeGap = Math.max(skill.projectedDemand - skill.currentSupply, 0);
      const share = totalGapBefore === 0 ? 0 : beforeGap / totalGapBefore;
      const afterGap = Math.max(0, Math.round(beforeGap - trainingEffect * share));

      return {
        skill: skill.skill,
        beforeGap,
        afterGap
      };
    })
  };
}
