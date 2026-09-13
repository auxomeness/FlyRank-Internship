import { NextResponse } from "next/server";
import { getExecution } from "@/lib/executions";

export async function GET(request, { params }) {
  const { id } = await params;
  const execution = await getExecution(id);

  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  return NextResponse.json(execution);
}
