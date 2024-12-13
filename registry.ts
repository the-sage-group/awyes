import JSON5 from "json5";
import { Express } from "express";
import { Command } from "commander";
import { Catalog, Node } from "./types";

export function server(): Promise<Express> {
  return new Promise(async (resolve, reject) => {
    const { default: express } = await import("express");
    const { default: cors } = await import("cors");

    const rest = express();
    rest.use(cors());
    rest.use(express.json());
    rest.set("json replacer", (key, value) => {
      if (typeof value === "function") {
        return value.name;
      }
      return value;
    });

    rest
      .listen(3000, () => {
        resolve(rest);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

export function receivers(server: Express, catalog: Catalog) {
  server.get("/", (req, res) => {
    res.send(catalog);
  });
  return function (action: Node) {
    server.get(`/${action.id}`, (req, res) => {
      const graph = { nodes: [], edges: [] };
      function resolveDeps(node: Node) {
        if (graph.nodes.find((n) => n.id === node.id)) return;

        graph.nodes.push(node);

        const deps = node.metadata.deps;
        for (const dep of deps) {
          const depNode = catalog[dep];
          if (!depNode) continue;

          graph.edges.push({
            source: depNode.id,
            target: node.id,
          });

          resolveDeps(depNode);
        }
      }

      resolveDeps(action);
      res.send(graph);
    });

    server.post(`/${action.id}`, (req, res) => {
      res.send(req.body);
    });
  };
}

export function callers(program: Command, catalog: Catalog) {
  return function (action: Node) {
    program
      .command(action.id)
      .description(`Run the ${action.id} action`)
      .argument(
        `[params]`,
        `JSON string of the parameters for the ${action.id} action`,
        "{}"
      )
      .action(async (params: string) => {
        params = JSON5.parse(params);
        const response = await fetch(`http://localhost:3000/${action.id}`, {
          method: "POST",
          body: JSON.stringify(params),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(await response.json());
      });
  };
}

export function headless(program: Command, catalog: Catalog) {
  return function (action: Node) {
    program
      .command(action.id)
      .description(`Run the ${action.id} action`)
      .argument(
        `[params]`,
        `JSON string of the parameters for the ${action.id} action`,
        "{}"
      )
      .action(async (params: string) => {
        params = JSON5.parse(params);
        const result = await action.action(params);
        console.dir(result, { depth: null });
      });
  };
}
