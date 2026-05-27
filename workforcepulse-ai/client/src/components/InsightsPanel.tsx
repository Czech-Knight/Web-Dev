import { Lightbulb } from "lucide-react";
import type { Insight } from "../types";

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <section className="panel insightsPanel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">AI recommendations</p>
          <h2>System insights</h2>
        </div>
      </div>

      <div className="insightList">
        {insights.map((insight) => (
          <article key={insight.title} className="insightCard">
            <Lightbulb size={20} />
            <div>
              <div className="insightTopline">
                <strong>{insight.title}</strong>
                <span>{insight.impact}</span>
              </div>
              <p>{insight.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
