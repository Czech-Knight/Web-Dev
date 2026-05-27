import { useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";
import type { OccupationRecord, ScenarioResult } from "../types";

interface ScenarioSimulatorProps {
  occupations: OccupationRecord[];
  onRunScenario: (payload: { occupationIds: string[]; trainingSeats: number; months: number; region?: string }) => Promise<ScenarioResult>;
}

export function ScenarioSimulator({ occupations, onRunScenario }: ScenarioSimulatorProps) {
  const [selectedRole, setSelectedRole] = useState("fs-dev");
  const [trainingSeats, setTrainingSeats] = useState(120);
  const [months, setMonths] = useState(12);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedOccupation = useMemo(
    () => occupations.find((occupation) => occupation.id === selectedRole),
    [occupations, selectedRole]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsRunning(true);
    try {
      const scenario = await onRunScenario({
        occupationIds: [selectedRole],
        trainingSeats,
        months,
        region: selectedOccupation?.region
      });
      setResult(scenario);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="panel scenarioPanel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Decision support</p>
          <h2>Training scenario simulator</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="scenarioForm">
        <label>
          Target role
          <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
            {occupations.map((occupation) => (
              <option value={occupation.id} key={occupation.id}>{occupation.title}</option>
            ))}
          </select>
        </label>

        <label>
          Training seats
          <input
            type="number"
            min="1"
            max="5000"
            value={trainingSeats}
            onChange={(event) => setTrainingSeats(Number(event.target.value))}
          />
        </label>

        <label>
          Program duration months
          <input
            type="number"
            min="1"
            max="24"
            value={months}
            onChange={(event) => setMonths(Number(event.target.value))}
          />
        </label>

        <button type="submit" disabled={isRunning}>
          <PlayCircle size={18} /> {isRunning ? "Running model..." : "Run scenario"}
        </button>
      </form>

      {result && (
        <div className="scenarioResult">
          <div>
            <span>Projected filled roles</span>
            <strong>{result.projectedFilledRoles}</strong>
          </div>
          <div>
            <span>Remaining gap</span>
            <strong>{result.remainingGap}</strong>
          </div>
          <div>
            <span>ROI score</span>
            <strong>{result.roiScore}%</strong>
          </div>
          <p>{result.recommendedAction}</p>
        </div>
      )}
    </section>
  );
}
