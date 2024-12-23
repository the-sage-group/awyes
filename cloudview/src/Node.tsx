import * as awyes from "../../types";
import * as ReactFlow from "@xyflow/react";
import { Paper, Text, Stack, Group, Badge } from "@mantine/core";

export type FlowNode = ReactFlow.Node<awyes.Node, "flowNode">;

export function toFlowNode(node: awyes.Node): FlowNode {
  return {
    id: node.id,
    type: "flowNode",
    data: node,
    position: { x: 100, y: 100 },
  };
}

export function Node(props: ReactFlow.NodeProps<FlowNode>) {
  const { data } = props;

  return (
    <Paper shadow="sm" p="md" withBorder style={{ minWidth: 200 }}>
      <ReactFlow.Handle type="target" position={ReactFlow.Position.Top} />
      <ReactFlow.Handle type="source" position={ReactFlow.Position.Bottom} />
      <Stack gap="xs">
        {/* Function name/id */}
        <Text fw={700} size="lg">
          {data.id}
        </Text>

        {/* Parameters section */}
        <div>
          <Text size="sm" fw={500} c="dimmed">
            Parameters:
          </Text>
          <Stack gap="xs" ml="xs">
            {data.parameters.map((param, index) => (
              <Group key={index} gap="xs">
                <Text size="sm" c="blue">
                  {param.name}:
                </Text>
                <Badge variant="light" color="gray">
                  {param.type}
                </Badge>
              </Group>
            ))}
          </Stack>
        </div>

        {/* Return type */}
        <Group gap="xs">
          <Text size="sm" fw={500} c="dimmed">
            Returns:
          </Text>
          <Badge variant="light" color="green">
            {data.returnType}
          </Badge>
        </Group>
      </Stack>
    </Paper>
  );
}
