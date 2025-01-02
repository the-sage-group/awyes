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
import { Paper, Title, Group, Badge, Text } from "@mantine/core";
import { IconArrowsRandom } from "@tabler/icons-react";

import { FlowNode } from "./Node";
import { addFlowEdge, FlowEdge } from "./Edge";
import { FlowContext } from "./Context";
import { FlowGraphType, FlowNodeType, FlowEdgeType } from "./types";
import { FlowParameter } from "./NewFlow";

interface ExtendedFlowGraphType extends FlowGraphType {
  parameters: FlowParameter[];
}

const nodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes = {
  flowEdge: FlowEdge,
};

export default function Flow({ flow }: { flow: ExtendedFlowGraphType }) {
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
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          withBorder
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 5,
            maxWidth: "400px",
          }}
        >
          <Group gap="xs" mb="xs">
            <IconArrowsRandom
              size={20}
              style={{ color: "var(--mantine-color-blue-6)" }}
            />
            <Title order={4} style={{ margin: 0 }}>
              {flow.name}
            </Title>
          </Group>

          {flow.parameters.length > 0 && (
            <>
              <Text size="sm" c="dimmed" mb="xs">
                Parameters
              </Text>
              <Group gap="xs">
                {flow.parameters.map((param: FlowParameter, index: number) => (
                  <Badge key={index} size="sm" variant="light">
                    {param.name}
                  </Badge>
                ))}
              </Group>
            </>
          )}
        </Paper>
        <Controls />
        <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
      </ReactFlow>
    </FlowContext.Provider>
  );
}
