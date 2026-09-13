export function findStartNode(nodes, edges) {
  const targetIds = new Set(edges.map((edge) => edge.target));
  return nodes.find((node) => !targetIds.has(node.id)) ?? nodes[0] ?? null;
}

export function findNextNodeId(edges, currentNodeId, decision) {
  const normalized = decision === "YES" ? "YES" : "NO";
  const edge = edges.find(
    (candidate) => candidate.source === currentNodeId && candidate.data?.condition === normalized,
  );
  return edge?.target ?? null;
}

export function normalizeDecision(value) {
  const text = String(value ?? "").trim().toUpperCase();
  if (text.startsWith("YES")) return "YES";
  if (text.startsWith("NO")) return "NO";
  return null;
}

export function mockDecision(prompt, input) {
  const joined = `${prompt} ${input}`.toLowerCase();
  if (joined.includes("sales")) return "NO";
  if (joined.includes("support")) return "YES";
  if (joined.includes("billing") && joined.includes("invoice")) return "YES";
  if (joined.includes("bug") && (joined.includes("error") || joined.includes("crash"))) return "YES";
  return joined.length % 2 === 0 ? "YES" : "NO";
}
