import { Router } from "express";
import { z } from "zod";
import { occupations } from "../data/labourMarket.js";
import { buildForecast, buildSummaryMetrics, getOccupationById } from "../services/forecastService.js";
import { buildInsights, buildSkillGapRanking } from "../services/skillService.js";
import { runScenario } from "../services/scenarioService.js";

const router = Router();

const scenarioSchema = z.object({
  occupationIds: z.array(z.string()).min(1),
  trainingSeats: z.number().int().min(1).max(5000),
  months: z.number().int().min(1).max(24),
  region: z.enum(["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"]).optional()
});

router.get("/summary", (_request, response) => {
  response.json({ metrics: buildSummaryMetrics() });
});

router.get("/occupations", (request, response) => {
  const region = request.query.region?.toString();
  const category = request.query.category?.toString().toLowerCase();

  const filtered = occupations.filter((occupation) => {
    const matchesRegion = region ? occupation.region === region : true;
    const matchesCategory = category ? occupation.category.toLowerCase().includes(category) : true;
    return matchesRegion && matchesCategory;
  });

  response.json({ occupations: filtered });
});

router.get("/forecast/:occupationId", (request, response) => {
  const occupation = getOccupationById(request.params.occupationId);

  if (!occupation) {
    response.status(404).json({ message: "Occupation not found" });
    return;
  }

  response.json({ occupation, forecast: buildForecast(occupation) });
});

router.get("/skills", (_request, response) => {
  response.json({ skills: buildSkillGapRanking() });
});

router.get("/insights", (_request, response) => {
  response.json({ insights: buildInsights() });
});

router.get("/search", (request, response) => {
  const query = request.query.query?.toString().toLowerCase().trim() ?? "";

  if (!query) {
    response.json({ results: occupations });
    return;
  }

  const results = occupations.filter((occupation) => {
    return [
      occupation.title,
      occupation.category,
      occupation.region,
      ...occupation.requiredSkills,
      ...occupation.demandDrivers
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  response.json({ results });
});

router.post("/scenario", (request, response) => {
  const parsed = scenarioSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ message: "Invalid scenario payload", errors: parsed.error.flatten() });
    return;
  }

  response.json({ scenario: runScenario(parsed.data) });
});

export default router;
