import { useState } from "react";
import {
  Modal,
  TextInput,
  Stack,
  Group,
  ActionIcon,
  Paper,
  Title,
  Text,
  Button,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";

export type FlowParameter = {
  name: string;
};

interface NewFlowProps {
  opened: boolean;
  onClose: () => void;
  onCreateFlow: (name: string, parameters: FlowParameter[]) => void;
}

export function NewFlow({ opened, onClose, onCreateFlow }: NewFlowProps) {
  const [newFlowName, setNewFlowName] = useState("");
  const [parameters, setParameters] = useState<FlowParameter[]>([]);

  const handleCreateFlow = () => {
    onCreateFlow(newFlowName, parameters);
    setNewFlowName("");
    setParameters([]);
    onClose();
  };

  const addParameter = () => {
    setParameters([...parameters, { name: "" }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, value: string) => {
    setParameters(
      parameters.map((param, i) => (i === index ? { name: value } : param))
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      padding="xl"
      radius="md"
      title={<Title order={3}>Create New Flow</Title>}
    >
      <Stack gap="xl">
        <Stack gap="xs">
          <Text size="sm" fw={500}>Flow Name</Text>
          <TextInput
            placeholder="Enter flow name"
            value={newFlowName}
            onChange={(e) => setNewFlowName(e.currentTarget.value)}
            size="md"
          />
        </Stack>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={500} size="sm">Parameters</Text>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={addParameter}
            >
              Add Parameter
            </Button>
          </Group>

          {parameters.map((param, index) => (
            <Paper key={index} p="sm" withBorder>
              <Group gap="sm">
                <TextInput
                  placeholder="Parameter name"
                  value={param.name}
                  onChange={(e) => updateParameter(index, e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => removeParameter(index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreateFlow} disabled={!newFlowName}>
            Create Flow
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
} 