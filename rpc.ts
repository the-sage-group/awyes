import JSON5 from "json5";
import express from "express";
import { WebSocketServer } from "ws";
import { Command } from "commander";
import { validate } from "@deepkit/type";
import * as types from "./types";

export function asRPCs(workflows: types.Workflow<any>[], program: Command) {
  const app = express();
  app.use(express.json());
  app.listen(3000);

  workflows.forEach((flow) => {
    app.get(`/${flow.name}`, (req, res) => {
      res.send(flow({}));
    });

    app.post(`/${flow.name}`, (req, res) => {
      const params = JSON5.parse(req.body);
      const errors = validate<Parameters<typeof flow>[number]>(params);
      if (errors.length) {
        return console.error(errors);
      }
      flow(params).execute();
    });
  });
}
