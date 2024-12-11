import JSON5 from "json5";
import { Express } from "express";
import { Command } from "commander";

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

export function registerReceivers(server: Express) {
  return function (flow: Flow<any>) {
    server.get(`/${flow.name}`, (req, res) => {
      const graph = flow({});
      res.send({ nodes: graph.nodes, edges: graph.edges });
    });

    server.post(`/${flow.name}`, (req, res) => {
      res.send(req.body);
    });
  };
}

export function registerCallers(program: Command) {
  return function (flow: Flow<any>) {
    program
      .command(flow.name)
      .description(`Run the ${flow.name} flow`)
      .argument(
        `[params]`,
        `JSON string of the parameters for the ${flow.name} flow`,
        "{}"
      )
      .action(async (params: string) => {
        params = JSON5.parse(params);
        const errors = validate<Parameters<typeof flow>[number]>(params);
        if (errors.length) {
          console.log(errors);
          process.exit();
        }
        const response = await fetch(`http://localhost:3000/${flow.name}`, {
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

export function headless(program: Command) {
  return function (flow: Flow<any>) {
    program
      .command(flow.name)
      .description(`Run the ${flow.name} flow`)
      .argument(
        `[params]`,
        `JSON string of the parameters for the ${flow.name} flow`,
        "{}"
      )
      .action(async (params: string) => {
        params = JSON5.parse(params);
        const errors = validate<Parameters<typeof flow>[number]>(params);
        if (errors.length) {
          return console.error(errors);
        }
        await flow(params).execute((node, context) => {
          console.dir({ [node.name]: context }, { depth: null });
        });
      });
  };
}
