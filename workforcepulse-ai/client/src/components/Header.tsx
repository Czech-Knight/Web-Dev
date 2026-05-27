import { Activity, BrainCircuit } from "lucide-react";

export function Header() {
  return (
    <header className="hero">
      <nav className="nav">
        <div className="brand">
          <span className="brandIcon"><BrainCircuit size={22} /></span>
          <span>WorkforcePulse AI</span>
        </div>
        <span className="statusPill"><Activity size={16} /> Live demo data</span>
      </nav>

      <section className="heroGrid">
        <div>
          <p className="eyebrow">AI workforce intelligence platform</p>
          <h1>Predict workforce demand, skill gaps, and hiring pressure from one dashboard.</h1>
          <p className="heroText">
            A full-stack analytics product that connects a TypeScript API, forecasting logic, labour market data,
            scenario modelling, and a responsive React dashboard.
          </p>
        </div>
        <div className="heroCard">
          <span>Internship alignment</span>
          <strong>Full Stack + AI + Dashboards + APIs</strong>
          <p>Built to show practical experience with workforce analytics, model integration, and product-ready UI.</p>
        </div>
      </section>
    </header>
  );
}
