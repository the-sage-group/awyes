import { useEffect } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FlowNode } from "./Node";
import { addFlowEdge, FlowEdge } from "./Edge";
import { FlowContext } from "./Context";
import { FlowGraphType, FlowNodeType, FlowEdgeType } from "./types";

const nodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes = {
  flowEdge: FlowEdge,
};

export default function Flow({ flow }: { flow: FlowGraphType }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdgeType>([]);

  useEffect(() => {
    setNodes([
      ...nodes,
      ...flow.nodes.filter((n) => !nodes.some((node) => node.id === n.id)),
    ]);
    setEdges([
      ...edges,
      ...flow.edges.filter((e) => !edges.some((edge) => edge.id === e.id)),
    ]);
  }, [flow]);

  return (
    <FlowContext.Provider value={{ nodes, edges, setNodes, setEdges }}>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        minZoom={0.1}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={(connection) => addFlowEdge(connection, edges, setEdges)}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Controls />
        <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
      </ReactFlow>
    </FlowContext.Provider>
  );
}
