import { useContext, useState } from "react";
import { v4 as uuid } from "uuid";
import { Connection, EdgeProps } from "@xyflow/react";
import { BezierEdge } from "@xyflow/react";
import {
  Popover,
  Select,
  Stack,
  Button,
  Group,
  ActionIcon,
  Text,
  Box,
} from "@mantine/core";
import { IconTrash, IconPlus, IconArrowsExchange } from "@tabler/icons-react";
import { FlowEdgeType } from "./types";
import { FlowContext } from "./Context";

export function addFlowEdge(
  connection: Connection,
  edges: FlowEdgeType[],
  setEdges: (edges: FlowEdgeType[]) => void
) {
  const id = uuid();
  setEdges([
    ...edges,
    {
      id,
      source: connection.source,
      target: connection.target,
      data: {
        id,
        source: connection.source,
        target: connection.target,
        mappings: [],
      },
      type: "flowEdge",
    },
  ]);
}

interface ParameterMapping {
  sourceOutput: string;
  targetInput: string;
}

export function FlowEdge(props: EdgeProps<FlowEdgeType>) {
  const { edges, setEdges, nodes } = useContext(FlowContext);
  const { data: edge } = props;
  if (!edge) return null;

  const [opened, setOpened] = useState(true);
  const [mappings, setMappings] = useState<ParameterMapping[]>([
    { sourceOutput: "", targetInput: "" },
  ]);

  const sourceNode = nodes.find((node) => node.id === edge.source);
  const targetNode = nodes.find((node) => node.id === edge.target);

  const updateMapping = (
    index: number,
    field: keyof ParameterMapping,
    value: string | null
  ) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  };

  return (
    <Popover opened={opened} onChange={setOpened} closeOnClickOutside={false}>
      <Popover.Target>
        <g onClick={() => setOpened(true)}>
          <BezierEdge
            {...props}
            style={{
              strokeWidth: 2,
              cursor: "pointer",
            }}
          />
          <foreignObject
            width={50}
            height={50}
            x={(props.sourceX + props.targetX) / 2 - 15}
            y={(props.sourceY + props.targetY) / 2 - 15}
            style={{ cursor: "pointer" }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "50%",
                padding: 4,
                boxShadow: "0 0 2px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <IconArrowsExchange size={20} stroke={1} />
            </div>
          </foreignObject>
        </g>
      </Popover.Target>

      <Popover.Dropdown onClick={(e) => e.stopPropagation()}>
        <Stack gap="xs">
          <Group justify="flex-end">
            <Button
              variant="subtle"
              p={0}
              onClick={() =>
                setMappings([
                  ...mappings,
                  { sourceOutput: "", targetInput: "" },
                ])
              }
              color="gray"
              size="sm"
            >
              <Group gap={4}>
                <IconPlus size={14} stroke={1.5} />
                <Text size="sm" c="dimmed">
                  Add Mapping
                </Text>
              </Group>
            </Button>
          </Group>
          {mappings.map((mapping, index) => (
            <Group key={index} align="center" wrap="nowrap">
              <Select
                label={
                  <Text fw={500} size="sm">
                    Source Output
                  </Text>
                }
                data={sourceNode?.data.returns.map((output) => ({
                  value: output.name,
                  label: output.name,
                }))}
                value={mapping.sourceOutput}
                onChange={(val) => updateMapping(index, "sourceOutput", val)}
              />
              <Select
                label={
                  <Text fw={500} size="sm">
                    Target Input
                  </Text>
                }
                data={targetNode?.data.parameters.map((input) => ({
                  value: input.name,
                  label: input.name,
                }))}
                value={mapping.targetInput}
                onChange={(val) => updateMapping(index, "targetInput", val)}
              />
              <Box pt={24}>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => {
                    setMappings(mappings.filter((_, i) => i !== index));
                  }}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              </Box>
            </Group>
          ))}

          <Button
            onClick={() => setOpened(false)}
            variant="filled"
            color="blue"
            fullWidth
            size="md"
          >
            Done
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
