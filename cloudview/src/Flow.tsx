import * as awyes from "../../types";
import * as xyflow from "@xyflow/react";
import * as cloudview from "./Node";

import "@xyflow/react/dist/style.css";
import { useEffect } from "react";

const nodeTypes = {
  flowNode: cloudview.Node,
};

export default function Flow({ flow }: { flow: awyes.Graph }) {
  const [nodes, setNodes, onNodesChange] =
    xyflow.useNodesState<cloudview.FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = xyflow.useEdgesState<xyflow.Edge>(
    []
  );

  useEffect(() => {
    setNodes([
      ...nodes,
      ...flow.nodes
        .filter((node) => !nodes.some((n) => n.id === node.id))
        .map(cloudview.toFlowNode),
    ]);
    setEdges(flow.edges);
  }, [flow]);

  return (
    <xyflow.ReactFlow
      fitView
      nodes={nodes}
      edges={edges}
      minZoom={0.1}
      nodeTypes={nodeTypes}
      onConnect={console.log}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    >
      <xyflow.Controls />
      <xyflow.Background
        variant={xyflow.BackgroundVariant.Dots}
        gap={12}
        size={1}
      />
    </xyflow.ReactFlow>
  );
}
