import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SkillGapRecord } from "../types";

interface SkillGapPanelProps {
  skills: SkillGapRecord[];
}

export function SkillGapPanel({ skills }: SkillGapPanelProps) {
  const topSkills = skills.slice(0, 6);

  return (
    <section className="panel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Labour market intelligence</p>
          <h2>Skill gap ranking</h2>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={topSkills} layout="vertical" margin={{ top: 12, right: 20, bottom: 12, left: 40 }}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis type="number" domain={[0, 50]} />
          <YAxis type="category" dataKey="skill" width={90} />
          <Tooltip />
          <Bar dataKey="gapScore" name="Gap score" fill="#2563eb" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="skillList">
        {topSkills.map((skill) => (
          <div className="skillItem" key={skill.skill}>
            <span>{skill.skill}</span>
            <strong>{skill.priority}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
