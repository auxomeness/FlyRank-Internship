import OpenAI from "openai";
import { inngest } from "./client";
import { findNextNodeId, findStartNode, mockDecision, normalizeDecision } from "@/lib/workflow";
import { patchExecution } from "@/lib/executions";

async function askModel({ prompt, input }) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      decision: mockDecision(prompt, input),
      provider: "mock",
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You are a workflow decision engine. Answer with exactly one token: YES or NO. No punctuation. No explanation.",
      },
      {
        role: "user",
        content: JSON.stringify({ prompt, input }),
      },
    ],
  });

  const decision = normalizeDecision(response.choices[0]?.message?.content);
  if (!decision) {
    throw new Error("Model did not return YES or NO");
  }

  return {
    decision,
    provider: "openai",
  };
}

export const executeWorkflow = inngest.createFunction(
  { id: "execute-visual-ai-workflow", retries: 1 },
  { event: "workflow/run.requested" },
  async ({ event, step }) => {
    const { executionId, graph, input } = event.data;
    const { nodes, edges } = graph;
    const startNode = findStartNode(nodes, edges);

    if (!startNode) {
      throw new Error("Workflow has no nodes to execute");
    }

    await step.run("mark-execution-running", async () => {
      await patchExecution(executionId, (current) => ({
        ...current,
        status: "running",
        startedAt: new Date().toISOString(),
      }));
    });

    const visited = new Set();
    const order = [];
    let activeNode = startNode;
    let activeEdgeId = null;

    while (activeNode) {
      if (visited.has(activeNode.id)) {
        throw new Error(`Workflow loop detected at node ${activeNode.id}`);
      }

      visited.add(activeNode.id);
      order.push(activeNode.id);

      const result = await step.run(`node-${activeNode.id}`, async () => {
        await patchExecution(executionId, (current) => ({
          ...current,
          activeNodeId: activeNode.id,
          activeEdgeId,
          logs: [
            ...current.logs,
            {
              nodeId: activeNode.id,
              nodeLabel: activeNode.data.label,
              prompt: activeNode.data.prompt,
              status: "running",
              at: new Date().toISOString(),
            },
          ],
        }));

        const decision = await askModel({
          prompt: activeNode.data.prompt,
          input,
        });

        await patchExecution(executionId, (current) => ({
          ...current,
          logs: current.logs.map((entry) =>
            entry.nodeId === activeNode.id && entry.status === "running"
              ? {
                  ...entry,
                  status: "complete",
                  decision: decision.decision,
                  provider: decision.provider,
                  completedAt: new Date().toISOString(),
                }
              : entry,
          ),
        }));

        return decision;
      });

      const nextNodeId = findNextNodeId(edges, activeNode.id, result.decision);
      activeEdgeId =
        edges.find(
          (edge) => edge.source === activeNode.id && edge.target === nextNodeId && edge.data?.condition === result.decision,
        )?.id ?? null;

      activeNode = nextNodeId ? nodes.find((node) => node.id === nextNodeId) : null;
    }

    await step.run("mark-execution-complete", async () => {
      await patchExecution(executionId, (current) => ({
        ...current,
        status: "complete",
        activeNodeId: null,
        activeEdgeId,
        order,
        completedAt: new Date().toISOString(),
      }));
    });

    return { executionId, order };
  },
);
