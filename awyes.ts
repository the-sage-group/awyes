import express from "express";
import { App } from "@deepkit/app";
import { validate } from "@deepkit/type";

import * as types from "./types";

export * from "./types";
export function register(...workflows: types.Workflow<any>[]) {
  const capp = new App({});
  const eapp = express();
  eapp.use(express.json());

  workflows.forEach((flow) => {
    console.log(
      validate<Parameters<typeof flow>[number]>({
        domainName: "string",
        subDomains: ["string"],
      })
    );

    capp.command(flow.name, () => {
      console.log("Whoa");
    });

    eapp.get(`/${flow.name}`, (req, res) => {
      res.send(flow({}));
    });

    eapp.post(`/${flow.name}`, (req, res) => {
      console.log(req.body);
      res.send(req.body);
    });
  });

  capp.run();
  // eapp.listen(3000, () => {});
}
