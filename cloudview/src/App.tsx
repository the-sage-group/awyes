import { ws, http } from "./client";
import { AppShell } from "@mantine/core";
import Flow from "./Flow";
import "./App.css";

export default function App() {
  console.log(ws, http);
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
      }}
      padding="md"
    >
      <AppShell.Header></AppShell.Header>

      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

      <AppShell.Main>
        <Flow />
      </AppShell.Main>
    </AppShell>
  );
}
