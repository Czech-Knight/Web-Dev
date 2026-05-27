import type { OccupationRecord } from "../types";

interface OccupationTableProps {
  occupations: OccupationRecord[];
  selectedOccupationId: string;
  onSelectOccupation: (id: string) => void;
}

export function OccupationTable({ occupations, selectedOccupationId, onSelectOccupation }: OccupationTableProps) {
  return (
    <section className="panel largePanel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Workforce dataset</p>
          <h2>Priority occupations</h2>
        </div>
        <span className="tag">{occupations.length} roles tracked</span>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Region</th>
              <th>Demand</th>
              <th>Growth</th>
              <th>Vacancies</th>
              <th>Core skills</th>
            </tr>
          </thead>
          <tbody>
            {occupations.map((occupation) => (
              <tr
                key={occupation.id}
                className={selectedOccupationId === occupation.id ? "selectedRow" : ""}
                onClick={() => onSelectOccupation(occupation.id)}
              >
                <td>
                  <strong>{occupation.title}</strong>
                  <span>{occupation.category}</span>
                </td>
                <td>{occupation.region}</td>
                <td>{occupation.currentDemand}/100</td>
                <td>{occupation.growthRate.toFixed(1)}%</td>
                <td>{occupation.vacancies.toLocaleString("en-AU")}</td>
                <td>{occupation.requiredSkills.slice(0, 3).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
