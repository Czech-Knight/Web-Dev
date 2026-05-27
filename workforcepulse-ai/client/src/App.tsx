import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { KpiCard } from "./components/KpiCard";
import { ForecastChart } from "./components/ForecastChart";
import { SkillGapPanel } from "./components/SkillGapPanel";
import { OccupationTable } from "./components/OccupationTable";
import { ScenarioSimulator } from "./components/ScenarioSimulator";
import { InsightsPanel } from "./components/InsightsPanel";
import { getForecast, getInsights, getOccupations, getSkills, getSummary, runScenario } from "./services/api";
import type { ForecastPoint, Insight, OccupationRecord, ScenarioResult, SkillGapRecord, SummaryMetric } from "./types";

function App() {
  const [metrics, setMetrics] = useState<SummaryMetric[]>([]);
  const [occupations, setOccupations] = useState<OccupationRecord[]>([]);
  const [skills, setSkills] = useState<SkillGapRecord[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedOccupationId, setSelectedOccupationId] = useState("fs-dev");
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationRecord>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [summaryResponse, occupationResponse, skillsResponse, insightsResponse] = await Promise.all([
          getSummary(),
          getOccupations(),
          getSkills(),
          getInsights()
        ]);

        setMetrics(summaryResponse.metrics);
        setOccupations(occupationResponse.occupations);
        setSkills(skillsResponse.skills);
        setInsights(insightsResponse.insights);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard data");
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadForecast() {
      try {
        const response = await getForecast(selectedOccupationId);
        setSelectedOccupation(response.occupation);
        setForecast(response.forecast);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to load forecast");
      }
    }

    loadForecast();
  }, [selectedOccupationId]);

  async function handleScenario(payload: { occupationIds: string[]; trainingSeats: number; months: number; region?: string }): Promise<ScenarioResult> {
    const response = await runScenario(payload);
    return response.scenario;
  }

  return (
    <main>
      <Header />

      {error && <div className="errorBanner">{error}. Check that the API is running on port 4000.</div>}

      <section className="kpiGrid">
        {metrics.map((metric) => <KpiCard key={metric.label} metric={metric} />)}
      </section>

      <section className="dashboardGrid">
        <ForecastChart forecast={forecast} occupation={selectedOccupation} />
        <SkillGapPanel skills={skills} />
      </section>

      <section className="dashboardGrid lowerGrid">
        <OccupationTable
          occupations={occupations}
          selectedOccupationId={selectedOccupationId}
          onSelectOccupation={setSelectedOccupationId}
        />
        <ScenarioSimulator occupations={occupations} onRunScenario={handleScenario} />
      </section>

      <InsightsPanel insights={insights} />
    </main>
  );
}

export default App;
