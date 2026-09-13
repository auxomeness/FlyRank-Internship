import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { createExecution } from "@/lib/executions";

export async function POST(request) {
  const body = await request.json();
  const { graph, input } = body;

  if (!graph?.nodes?.length) {
    return NextResponse.json({ error: "Workflow must include at least one node." }, { status: 400 });
  }

  const executionId = crypto.randomUUID();

  await createExecution({
    id: executionId,
    status: "queued",
    input,
    graph,
    logs: [],
    order: [],
    activeNodeId: null,
    activeEdgeId: null,
    createdAt: new Date().toISOString(),
  });

  await inngest.send({
    name: "workflow/run.requested",
    data: {
      executionId,
      graph,
      input,
    },
  });

  return NextResponse.json({ executionId });
}
