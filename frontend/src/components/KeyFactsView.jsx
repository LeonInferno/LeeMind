function parseKeyFacts(text) {
  return text
    .split("\n")
    .filter(l => /^\d+[.)]\s/.test(l.trim()))
    .map(l => l.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

const FACT_COLORS = [
  "rgba(59,130,246,0.13)",
  "rgba(96,165,250,0.11)",
  "rgba(125,211,252,0.10)",
  "rgba(147,197,253,0.10)",
  "rgba(56,189,248,0.10)",
  "rgba(59,130,246,0.09)",
];

export default function KeyFactsView({ content }) {
  const facts = parseKeyFacts(content);

  if (facts.length === 0) {
    return <div className="toolContent" style={{ padding: 16, whiteSpace: "pre-wrap" }}>{content}</div>;
  }

  return (
    <div className="keyFactsWrap">
      <div className="keyFactsHeader">
        <span className="keyFactsCount">{facts.length} Key Facts</span>
      </div>
      <div className="keyFactsGrid">
        {facts.map((fact, i) => (
          <div
            key={i}
            className="keyFact"
            style={{ background: FACT_COLORS[i % FACT_COLORS.length] }}
          >
            <div className="keyFactNum">{String(i + 1).padStart(2, "0")}</div>
            <div className="keyFactText">{fact}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
