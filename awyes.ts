import { Command } from "commander";
import { validate } from "@deepkit/type";
import JSON5 from "json5";

import * as types from "./types";
export * from "./types";

export function register(...workflows: types.Workflow<any>[]) {
  const program = new Command();

  program.name("awyes").description("CLI tool for running workflows");

  workflows.forEach((flow) => {
    program
      .command(flow.name)
      .description("Run the " + flow.name + " workflow")
      .argument(
        `<params>`,
        `JSON string of the parameters for the ${flow.name} workflow`
      )
      .action((params: string) => {
        params = JSON5.parse(params);
        const errors = validate<Parameters<typeof flow>[number]>(params);
        if (errors.length) {
          return console.error(errors);
        }
        console.log(flow(params));
      });
  });

  program.parse();
}
