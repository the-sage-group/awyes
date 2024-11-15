import JSON5 from "json5";
import { Command } from "commander";
import { validate } from "@deepkit/type";
import * as types from "./types";

export function asCommands(workflows: types.Workflow<any>[], program: Command) {
  workflows.forEach((flow) => {
    console.log("CLI", flow.name);
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
        flow(params).execute();
      });
  });
}
