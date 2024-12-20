import { AppShell } from "@mantine/core";
import { NavLink, useParams } from "react-router";
import { useEffect, useState } from "react";

import Flow from "./Flow";
import "./App.css";

export default function App() {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/").then((res) => {
      res.json().then((data) => {
        setWorkflows(data);
      });
    });
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
      }}
      padding="md"
    >
      <AppShell.Header p="md">
        <div>CloudView</div>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {workflows.map((workflow) => (
          <NavLink key={workflow} to={`${workflow}`}>
            {workflow}
          </NavLink>
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Flow />
      </AppShell.Main>
    </AppShell>
  );
}
