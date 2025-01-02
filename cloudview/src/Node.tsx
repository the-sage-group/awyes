import { v4 as uuid } from "uuid";
import { Node } from "../../types";
import { NodeProps, Handle, Position } from "@xyflow/react";
import { Paper, Text, Stack, Group, Badge, TextInput } from "@mantine/core";
import { useContext, useState } from "react";
import { FlowNodeType } from "./types";
import { FlowContext } from "./Context";

export function toFlowNode(node: Node): FlowNodeType {
  return {
    id: uuid(),
    type: "flowNode",
    data: node,
    position: { x: 100, y: 100 },
  };
}

export function FlowNode(props: NodeProps<FlowNodeType>) {
  const { nodes, setNodes } = useContext(FlowContext);

  const { id, data: node } = props;
  const [nodeName, setNodeName] = useState(node.name);
  const [isEditing, setIsEditing] = useState(true);

  const updateNodeName = () => {
    setIsEditing(false);
    setNodes(
      nodes.map((oldNode) =>
        oldNode.id === id
          ? { ...oldNode, data: { ...oldNode.data, name: nodeName } }
          : oldNode
      )
    );
  };

  return (
    <Paper shadow="sm" p="md" withBorder style={{ minWidth: 200 }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Stack gap="md">
        {/* Name section */}
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Name
          </Text>
          {isEditing ? (
            <TextInput
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="Enter node name"
              required
              style={{ flex: 1 }}
              onBlur={updateNodeName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateNodeName();
                }
              }}
            />
          ) : (
            <Text
              size="lg"
              fw={700}
              onDoubleClick={() => setIsEditing(true)}
              style={{ cursor: "pointer" }}
            >
              {nodeName}
            </Text>
          )}
        </div>

        {/* Node Type section */}
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Type
          </Text>
          <Group gap={8}>
            <Badge variant="dot" color="violet" size="sm">
              {node.type}
            </Badge>
          </Group>
        </div>

        {/* Parameters section */}
        {node.parameters.length > 0 && (
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Parameters
            </Text>
            <Stack gap={6}>
              {node.parameters.map((param, index) => (
                <Group key={index} gap={8}>
                  <Text size="sm" fw={500}>
                    {param.name}
                  </Text>
                  <Badge variant="dot" color="blue" size="sm">
                    {param.type}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </div>
        )}

        {/* Returns section */}
        {node.returns.length > 0 && (
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Returns
            </Text>
            <Stack gap={6}>
              {node.returns.map((ret, index) => (
                <Group key={index} gap={8}>
                  <Text size="sm" fw={500}>
                    {ret.name}
                  </Text>
                  <Badge variant="dot" color="green" size="sm">
                    {ret.type}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    </Paper>
  );
}
