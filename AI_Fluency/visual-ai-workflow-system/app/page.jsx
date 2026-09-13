"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Download, Play, Plus, RotateCcw, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialNodes = [
  {
    id: "support-check",
    type: "decision",
    position: { x: 80, y: 110 },
    data: {
      label: "Support Check",
      prompt: "Is this a support request?",
    },
  },
  {
    id: "bug-check",
    type: "decision",
    position: { x: 420, y: 40 },
    data: {
      label: "Bug Check",
      prompt: "Is this about an error, bug, crash, or broken product behavior?",
    },
  },
  {
    id: "sales-check",
    type: "decision",
    position: { x: 420, y: 260 },
    data: {
      label: "Sales Check",
      prompt: "Is this a sales or pricing request?",
    },
  },
];

const initialEdges = [
  {
    id: "support-yes-bug",
    source: "support-check",
    target: "bug-check",
    label: "YES",
    data: { condition: "YES" },
    className: "edge-yes",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "support-no-sales",
    source: "support-check",
    target: "sales-check",
    label: "NO",
    data: { condition: "NO" },
    className: "edge-no",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

function DecisionNode({ id, data }) {
  const stateClass = data.executionState === "active" ? "active" : data.executionState === "done" ? "done" : "";

  return (
    <div className={`decision-node ${stateClass}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node-head">
        <strong>{data.label}</strong>
        {data.lastDecision && <span className={`badge badge-${data.lastDecision.toLowerCase()}`}>{data.lastDecision}</span>}
      </div>
      <div className="node-body">
        <p>{data.prompt}</p>
        <span className="small-muted">Step id: {id}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { decision: DecisionNode };

function edgeClass(condition, active) {
  return [condition === "YES" ? "edge-yes" : "edge-no", active ? "edge-active" : ""].filter(Boolean).join(" ");
}

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodes[0].id);
  const [edgeMode, setEdgeMode] = useState("YES");
  const [input, setInput] = useState("A customer says the dashboard crashes when exporting a report.");
  const [executionId, setExecutionId] = useState(null);
  const [execution, setExecution] = useState(null);
  const [jsonDraft, setJsonDraft] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? nodes[0] ?? null,
    [nodes, selectedNodeId],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("visual-ai-workflow");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.nodes?.length) setNodes(parsed.nodes);
      if (parsed.edges) setEdges(parsed.edges);
    } catch {
      setError("Saved workflow could not be loaded.");
    }
  }, [setEdges, setNodes]);

  useEffect(() => {
    const graph = { nodes, edges };
    window.localStorage.setItem("visual-ai-workflow", JSON.stringify(graph));
    setJsonDraft(JSON.stringify(graph, null, 2));
  }, [nodes, edges]);

  useEffect(() => {
    if (!executionId) return undefined;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/executions/${executionId}`);
      if (!response.ok) return;
      const payload = await response.json();
      setExecution(payload);
      setIsRunning(payload.status === "queued" || payload.status === "running");
      if (!["queued", "running"].includes(payload.status)) {
        setExecutionId(null);
      }

      setNodes((current) =>
        current.map((node) => {
          const log = payload.logs.find((entry) => entry.nodeId === node.id && entry.status === "complete");
          return {
            ...node,
            data: {
              ...node.data,
              executionState:
                payload.activeNodeId === node.id ? "active" : payload.order.includes(node.id) || log ? "done" : "",
              lastDecision: log?.decision ?? null,
            },
          };
        }),
      );

      setEdges((current) =>
        current.map((edge) => ({
          ...edge,
          className: edgeClass(edge.data?.condition, edge.id === payload.activeEdgeId),
        })),
      );
    }, 900);

    return () => window.clearInterval(timer);
  }, [executionId, setEdges, setNodes]);

  const onConnect = useCallback(
    (connection) => {
      const edge = {
        ...connection,
        id: `${connection.source}-${edgeMode.toLowerCase()}-${connection.target}-${Date.now()}`,
        label: edgeMode,
        data: { condition: edgeMode },
        className: edgeClass(edgeMode, false),
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((current) => addEdge(edge, current));
    },
    [edgeMode, setEdges],
  );

  function addDecisionNode() {
    const id = `node-${Date.now()}`;
    setNodes((current) => [
      ...current,
      {
        id,
        type: "decision",
        position: { x: 140 + current.length * 48, y: 120 + current.length * 44 },
        data: {
          label: `Decision ${current.length + 1}`,
          prompt: "Ask a YES or NO question here.",
        },
      },
    ]);
    setSelectedNodeId(id);
  }

  function updateSelectedNode(field, value) {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            }
          : node,
      ),
    );
  }

  function saveWorkflow() {
    window.localStorage.setItem("visual-ai-workflow", JSON.stringify({ nodes, edges }));
  }

  function resetWorkflow() {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setExecution(null);
    setExecutionId(null);
    setSelectedNodeId(initialNodes[0].id);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "visual-ai-workflow.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importJson() {
    try {
      const parsed = JSON.parse(jsonDraft);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error("JSON must contain nodes and edges arrays.");
      }
      setNodes(parsed.nodes);
      setEdges(parsed.edges);
      setError("");
    } catch (importError) {
      setError(importError.message);
    }
  }

  async function runWorkflow() {
    setError("");
    setIsRunning(true);
    setExecution(null);
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        data: { ...node.data, executionState: "", lastDecision: null },
      })),
    );

    const response = await fetch("/api/run-workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ graph: { nodes, edges }, input }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Workflow run failed.");
      setIsRunning(false);
      return;
    }

    setExecutionId(payload.executionId);
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div className="brand">
            <strong>Visual AI Workflow System</strong>
            <span>React Flow editor + Inngest execution + YES/NO AI steps</span>
          </div>
          <div className="actions">
            <Button onClick={addDecisionNode} variant="secondary">
              <Plus size={16} /> Add node
            </Button>
            <Button onClick={saveWorkflow} variant="secondary">
              <Save size={16} /> Save
            </Button>
            <Button onClick={exportJson} variant="secondary">
              <Download size={16} /> Export
            </Button>
            <Button onClick={runWorkflow} disabled={isRunning}>
              <Play size={16} /> {isRunning ? "Running" : "Run"}
            </Button>
          </div>
        </header>
        <div className="canvas-wrap">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </section>

      <aside className="sidebar">
        <Card>
          <CardHeader>
            <CardTitle>Run input</CardTitle>
            <span className="hint">The same text is sent to each node prompt during traversal.</span>
          </CardHeader>
          <CardContent>
            <Textarea value={input} onChange={(event) => setInput(event.target.value)} />
            {error && <p className="small-muted">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit selected node</CardTitle>
            <span className="hint">Each node must ask a decision question answerable by YES or NO.</span>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <>
                <div className="field">
                  <label>Label</label>
                  <Input value={selectedNode.data.label} onChange={(event) => updateSelectedNode("label", event.target.value)} />
                </div>
                <div className="field">
                  <label>Prompt</label>
                  <Textarea
                    value={selectedNode.data.prompt}
                    onChange={(event) => updateSelectedNode("prompt", event.target.value)}
                  />
                </div>
                <div className="field">
                  <label>New edge type</label>
                  <div className="row">
                    <Button variant={edgeMode === "YES" ? "default" : "secondary"} onClick={() => setEdgeMode("YES")}>
                      YES path
                    </Button>
                    <Button variant={edgeMode === "NO" ? "default" : "secondary"} onClick={() => setEdgeMode("NO")}>
                      NO path
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="hint">Select or add a node.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution logs</CardTitle>
            <span className="hint">{execution?.status ?? "No run yet"}</span>
          </CardHeader>
          <CardContent>
            <div className="logs">
              {execution?.logs?.length ? (
                execution.logs.map((entry, index) => (
                  <div className="log-entry" key={`${entry.nodeId}-${index}`}>
                    <strong>{entry.nodeLabel}</strong>
                    <span>{entry.prompt}</span>
                    <span>
                      {entry.status}
                      {entry.decision ? ` · ${entry.decision}` : ""}
                      {entry.provider ? ` · ${entry.provider}` : ""}
                    </span>
                  </div>
                ))
              ) : (
                <p className="hint">Run the workflow to see node order and decisions.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JSON import/export</CardTitle>
            <span className="hint">Edit this JSON directly or download a workflow file.</span>
          </CardHeader>
          <CardContent>
            <Textarea className="json-box" value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} />
            <div className="row">
              <Button onClick={importJson} variant="secondary">
                <Upload size={16} /> Import JSON
              </Button>
              <Button onClick={resetWorkflow} variant="danger">
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
