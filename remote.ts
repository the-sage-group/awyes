import JSON5 from "json5";
import { Express } from "express";
import { Command } from "commander";
import { validate } from "@deepkit/type";
import { Workflow } from "./types";

export function createServer(): Promise<Express> {
  return new Promise(async (resolve, reject) => {
    const { default: express } = await import("express");
    const { default: cors } = await import("cors");

    const server = express();
    server.use(cors());
    server.use(express.json());

    server
      .listen(3000, () => {
        resolve(server);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

export function registerReceivers(server: Express) {
  return function (workflow: Workflow<any>) {
    server.get(`/${workflow.name}`, (req, res) => {
      res.send(workflow({}));
    });

    server.post(`/${workflow.name}`, (req, res) => {
      res.send(req.body);
    });
  };
}

export function registerCallers(program: Command) {
  return function (workflow: Workflow<any>) {
    program
      .command(workflow.name)
      .description(`Run the ${workflow.name} workflow`)
      .argument(
        `[params]`,
        `JSON string of the parameters for the ${workflow.name} workflow`,
        "{}"
      )
      .action(async (params: string) => {
        params = JSON5.parse(params);
        const errors = validate<Parameters<typeof workflow>[number]>(params);
        if (errors.length) {
          return console.error(errors);
        }
        fetch(`http://localhost:3000/${workflow.name}`, {
          method: "POST",
          body: params,
        });
      });
  };
}
