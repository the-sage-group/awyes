import { Node as AwYesNode } from "../../types";
import { AppShell, Button } from "@mantine/core";
import { useEffect, useState } from "react";

import Flow from "./Flow";
import { FlowGraphType } from "./types";
import { Search } from "./Search";
import { SpotlightActionData, spotlight } from "@mantine/spotlight";
import { IconFunction, IconPlus } from "@tabler/icons-react";
import { toFlowNode } from "./Node";

export default function App() {
  const [actions, setActions] = useState<SpotlightActionData[]>([]);
  const [flow, setFlow] = useState<FlowGraphType>({
    nodes: [],
    edges: [],
  });

  useEffect(() => {
    fetch("http://localhost:3000/").then((res) => {
      res.json().then((nodes: AwYesNode[]) => {
        setActions(
          nodes.map((node) => ({
            id: node.id,
            label: node.type,
            description: node.description,
            onClick: () => {
              setFlow((flow) => ({
                ...flow,
                nodes: [...flow.nodes, toFlowNode(node)],
              }));
            },
            leftSection: <IconFunction />,
          }))
        );
      });
    });
  }, []);

  return (
    <AppShell
      header={{
        height: 50,
      }}
      padding="md"
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
        }}
      >
        <div>CloudView</div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Search actions={actions} />
          <Button
            onClick={() => spotlight.open()}
            leftSection={<IconPlus size={16} />}
          >
            Add Node
          </Button>
        </div>
      </AppShell.Header>

      <AppShell.Main>
        <Flow flow={flow} />
      </AppShell.Main>
    </AppShell>
  );
}
