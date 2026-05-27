import { skills } from "../data/labourMarket.js";

export function buildSkillGapRanking() {
  return skills
    .map((record) => {
      const gap = record.projectedDemand - record.currentSupply;
      const gapScore = Math.round((gap / record.projectedDemand) * 100);

      return {
        ...record,
        gap,
        gapScore,
        priority: gapScore >= 35 ? "Critical" : gapScore >= 25 ? "High" : "Medium"
      };
    })
    .sort((a, b) => b.gapScore - a.gapScore);
}

export function buildInsights() {
  const ranked = buildSkillGapRanking();
  const topSkill = ranked[0];
  const crossFunctionalSkills = ranked.filter((skill) => skill.relatedOccupations.length >= 2).slice(0, 3);

  return [
    {
      title: "Immediate training priority",
      description: `${topSkill.skill} has the largest simulated demand-supply gap. Short courses and internal upskilling should target this skill first.`,
      impact: "High"
    },
    {
      title: "Best cross-role investment",
      description: `${crossFunctionalSkills.map((skill) => skill.skill).join(", ")} support multiple occupations, making them strong candidates for workforce-wide learning programs.`,
      impact: "High"
    },
    {
      title: "AI integration opportunity",
      description: "Roles linked to forecasting, analytics, data engineering, and full-stack platforms show the strongest combined growth pattern.",
      impact: "Medium"
    }
  ];
}
