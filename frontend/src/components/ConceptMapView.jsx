function parseConceptMap(text) {
  const lines = text.split("\n").filter(l => l.trim());
  const nodes = [];
  for (const line of lines) {
    const rootMatch = line.match(/^ROOT:\s*(.+)/i);
    const branchMatch = line.match(/^\s{2}BRANCH:\s*(.+)/i);
    const nodeMatch = line.match(/^\s{4}NODE:\s*(.+)/i);
    if (rootMatch) nodes.push({ type: "root", text: rootMatch[1].trim(), depth: 0 });
    else if (branchMatch) nodes.push({ type: "branch", text: branchMatch[1].trim(), depth: 1 });
    else if (nodeMatch) nodes.push({ type: "node", text: nodeMatch[1].trim(), depth: 2 });
    else if (line.trim()) nodes.push({ type: "node", text: line.trim(), depth: 0 });
  }
  return nodes;
}

export default function ConceptMapView({ content }) {
  const nodes = parseConceptMap(content);

  if (nodes.length === 0) {
    return <div className="toolContent" style={{ padding: 16, whiteSpace: "pre-wrap" }}>{content}</div>;
  }

  return (
    <div className="cmWrap">
      {nodes.map((node, i) => (
        <div key={i} className={`cmNode cmNode-${node.type}`} style={{ marginLeft: node.depth * 24 }}>
          {node.type === "root" && <span className="cmDot cmDotRoot" />}
          {node.type === "branch" && <span className="cmDot cmDotBranch" />}
          {node.type === "node" && <span className="cmDot cmDotLeaf" />}
          <span className="cmText">{node.text}</span>
        </div>
      ))}
    </div>
  );
}
