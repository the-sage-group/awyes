import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useEffect } from "react";
import { useParams } from "react-router";

import * as types from "../../catalog";

const initialNodes: Node[] = [
  // { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  // { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges: Edge[] = [
  // { id: "e1-2", source: "1", target: "2" }
];

export default function Flow() {
  const { route } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (!route) return;
    fetch(`http://localhost:3000/${route}`).then(async (res) => {
      const data: types.Graph = await res.json();
      console.log(data);
    });
  }, [route]);

  return (
    <div style={{ width: "80vw", height: "90vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={console.log}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
