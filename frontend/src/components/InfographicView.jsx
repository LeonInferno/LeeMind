function parseInfographic(text) {
  const titleMatch = text.match(/TITLE:\s*(.+)/i);
  const subtitleMatch = text.match(/SUBTITLE:\s*(.+)/i);
  const stats = [...text.matchAll(/STAT:\s*(.+?)\s*\|\s*(.+)/gi)].map(m => ({
    label: m[1].trim(),
    value: m[2].trim(),
  }));
  const sections = [];
  const sectionBlocks = text.split(/SECTION:\s*/i).slice(1);
  for (const block of sectionBlocks) {
    const lines = block.split("\n").filter(l => l.trim());
    const title = lines[0]?.trim() || "";
    const bullets = lines.slice(1)
      .filter(l => /^[•\-\*]/.test(l.trim()))
      .map(l => l.replace(/^[•\-\*]\s*/, "").trim());
    if (title) sections.push({ title, bullets });
  }
  const takeawayMatch = text.match(/TAKEAWAY:\s*(.+)/i);
  return {
    title: titleMatch?.[1]?.trim() || "",
    subtitle: subtitleMatch?.[1]?.trim() || "",
    stats,
    sections,
    takeaway: takeawayMatch?.[1]?.trim() || "",
  };
}

const SECTION_COLORS = [
  { bg: "rgba(59,130,246,0.11)",  border: "rgba(59,130,246,0.26)",  dot: "#3b82f6" },
  { bg: "rgba(96,165,250,0.09)",  border: "rgba(96,165,250,0.24)",  dot: "#60a5fa" },
  { bg: "rgba(125,211,252,0.09)", border: "rgba(125,211,252,0.22)", dot: "#7dd3fc" },
  { bg: "rgba(147,197,253,0.09)", border: "rgba(147,197,253,0.20)", dot: "#93c5fd" },
  { bg: "rgba(56,189,248,0.09)",  border: "rgba(56,189,248,0.22)",  dot: "#38bdf8" },
];

export default function InfographicView({ content }) {
  const data = parseInfographic(content);

  if (!data.title && data.sections.length === 0) {
    return <div className="toolContent" style={{ padding: 16, whiteSpace: "pre-wrap" }}>{content}</div>;
  }

  return (
    <div className="infographicWrap">
      {/* Header */}
      <div className="infographicHeader">
        <div className="infographicTitle">{data.title}</div>
        {data.subtitle && <div className="infographicSubtitle">{data.subtitle}</div>}
      </div>

      {/* Stats */}
      {data.stats.length > 0 && (
        <div className="infographicStats">
          {data.stats.map((s, i) => (
            <div key={i} className="infographicStat">
              <div className="infographicStatValue">{s.value}</div>
              <div className="infographicStatLabel">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      {data.sections.length > 0 && (
        <div className="infographicSections">
          {data.sections.map((sec, i) => {
            const color = SECTION_COLORS[i % SECTION_COLORS.length];
            return (
              <div
                key={i}
                className="infographicSection"
                style={{ background: color.bg, border: `1px solid ${color.border}` }}
              >
                <div className="infographicSectionTitle" style={{ color: color.dot }}>
                  {sec.title}
                </div>
                <ul className="infographicBullets">
                  {sec.bullets.map((b, j) => (
                    <li key={j} className="infographicBullet">
                      <span className="infographicDot" style={{ background: color.dot }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Takeaway */}
      {data.takeaway && (
        <div className="infographicTakeaway">
          <span className="infographicTakeawayIcon">💡</span>
          <span>{data.takeaway}</span>
        </div>
      )}
    </div>
  );
}
