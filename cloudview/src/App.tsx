import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  AppShell,
  Button,
  Burger,
  NavLink,
  ScrollArea,
  Group,
  Title,
} from "@mantine/core";
import { IconPlus, IconFunction, IconArrowRight } from "@tabler/icons-react";

import Flow from "./Flow";
import { Node } from "../../types";
import { FlowGraphType } from "./types";
import { Search } from "./Search";
import { SpotlightActionData, spotlight } from "@mantine/spotlight";
import { toFlowNode } from "./Node";
import { NewFlow, FlowParameter } from "./NewFlow";

interface ExtendedFlowGraphType extends FlowGraphType {
  parameters: FlowParameter[];
}

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [actions, setActions] = useState<SpotlightActionData[]>([]);
  const [flows, setFlows] = useState<ExtendedFlowGraphType[]>([]);
  const [activeFlow, setActiveFlow] = useState<ExtendedFlowGraphType>({
    name: "untitled",
    nodes: [],
    edges: [],
    parameters: [],
  });

  useEffect(() => {
    fetch("http://localhost:3000/").then((res) => {
      res.json().then((nodes: Node[]) => {
        setActions(
          nodes.map((node) => ({
            id: node.id,
            label: node.type,
            description: node.description,
            onClick: () => {
              setActiveFlow((currentFlow) => ({
                ...currentFlow,
                nodes: [...currentFlow.nodes, toFlowNode(node)],
              }));
            },
            leftSection: <IconFunction />,
          }))
        );
      });
    });
  }, []);

  const handleCreateFlow = (name: string, parameters: FlowParameter[]) => {
    const newFlow = {
      name,
      nodes: [],
      edges: [],
      parameters,
    };
    setFlows([...flows, newFlow]);
    setActiveFlow(newFlow);
  };

  return (
    <AppShell
      header={{ height: 50 }}
      padding="md"
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { desktop: opened },
      }}
      styles={{
        main: {
          height: "100vh",
        },
      }}
    >
      <AppShell.Header
        p="md"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          background: "var(--mantine-color-white)",
        }}
      >
        <Group gap="lg">
          <Burger opened={!opened} onClick={toggle} size="sm" />
          <Title order={3} style={{ margin: 0, fontWeight: 600 }}>
            CloudView
          </Title>
        </Group>
        <Group gap="md">
          <Search actions={actions} />
          <Button
            variant="outline"
            onClick={openModal}
            leftSection={<IconPlus size={16} />}
          >
            New Flow
          </Button>
          <Button
            onClick={() => spotlight.open()}
            leftSection={<IconPlus size={16} />}
          >
            Add Node
          </Button>
        </Group>
      </AppShell.Header>

      <NewFlow
        opened={modalOpened}
        onClose={closeModal}
        onCreateFlow={handleCreateFlow}
      />

      <AppShell.Navbar p="md">
        <ScrollArea>
          {flows.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--mantine-color-gray-6)",
              }}
            >
              No flows yet!
            </div>
          ) : (
            flows.map((flow, index) => (
              <NavLink
                key={index}
                label={flow.name}
                rightSection={<IconArrowRight size={16} />}
                active={flow === activeFlow}
                onClick={() => setActiveFlow(flow)}
                styles={{
                  root: {
                    borderRadius: "var(--mantine-radius-sm)",
                    marginBottom: "0.5rem",
                  },
                }}
              />
            ))
          )}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Flow flow={activeFlow} />
      </AppShell.Main>
    </AppShell>
  );
}
